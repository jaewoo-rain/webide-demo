import re
from fastapi import HTTPException
from kubernetes import client
from kubernetes.client.rest import ApiException

from config import (INTERNAL_NOVNC_PORT, DEFAULT_STORAGE, WORKSPACE_MOUNT_PATH, VOLUME_NAME)

"""K8s 리소스 name/label에 안전한 문자열로 변환"""
def slug(s: str, max_len: int = 50) -> str:
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9-]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    if not s:
        s = "x"
    return s[:max_len]

"""파일 저장할 PVC 만들기 -> pvc_name과 namespace 이용하여 만들기"""
def create_pvc(v1: client.CoreV1Api, namespace: str, pvc_name: str, labels: dict, storage: str = DEFAULT_STORAGE):
    try:
        v1.read_namespaced_persistent_volume_claim(name=pvc_name, namespace=namespace)
        return # 기존에 존재하는지 확인
    except ApiException as e:
        if e.status != 404:
            raise

        # ReadWriteOnce (RWO) 한 노드에서 Read/Write
        # ReadOnlyMany (ROX) 여러 노드에서 Read only
        # ReadWriteMany (RWX) 여러 노드에서 Read/Write
    pvc = client.V1PersistentVolumeClaim(
        metadata=client.V1ObjectMeta(
            name=pvc_name, 
            labels=labels
            ),
        spec=client.V1PersistentVolumeClaimSpec(
            access_modes=["ReadWriteOnce"],
            resources=client.V1ResourceRequirements(requests={"storage": storage}),
            storage_class_name="local-path", 
        ),
    )
    v1.create_namespaced_persistent_volume_claim(namespace=namespace, body=pvc)

"""Deployment 만들기(Pod + Volume 생성)"""
def create_deployment(apps: client.AppsV1Api, namespace: str, deploy_name: str, labels: dict,
                      image: str, env: dict, pvc_name: str):
    try:
        apps.read_namespaced_deployment(name=deploy_name, namespace=namespace)
        return # 기존에 존재하는지 확인
    except ApiException as e:
        if e.status != 404:
            raise

    # PVC 이름이랑은 다르고, 컨테이너에서 마운트할 때 서로 연결해 주는 키
    dep = client.V1Deployment(
        metadata=client.V1ObjectMeta(
            name=deploy_name, 
            labels=labels
            ),
        spec=client.V1DeploymentSpec(
            replicas=1,
            selector=client.V1LabelSelector(match_labels={"key": labels["key"]}),
            template=client.V1PodTemplateSpec(
                metadata=client.V1ObjectMeta(labels=labels),
                spec=client.V1PodSpec(
                    containers=[
                        client.V1Container(
                            name="novnc",
                            image=image,
                            ports=[client.V1ContainerPort(container_port=INTERNAL_NOVNC_PORT)],
                            env=[client.V1EnvVar(name=k, value=str(v)) for k, v in env.items()],
                            volume_mounts=[
                                client.V1VolumeMount(
                                    name=VOLUME_NAME, # Pod 안에서 이 볼륨을 부르는 이름
                                    mount_path=WORKSPACE_MOUNT_PATH,
                                )
                            ],
                        )
                    ],
                    volumes=[
                        client.V1Volume(
                            name=VOLUME_NAME, # 어떤 볼륨을 붙일지 선택
                            persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(
                                claim_name=pvc_name
                            ),
                        )
                    ],
                ),
            ),
        ),
    )
    apps.create_namespaced_deployment(namespace=namespace, body=dep)


"""Service가 이미 있으면 nodePort 반환. 없으면 allowed_ports에서 빈 포트 찾아 생성."""
def create_service_nodeport(v1: client.CoreV1Api, namespace: str, svc_name: str, labels: dict, allowed_ports: list[int]) -> int:
    try:
        svc = v1.read_namespaced_service(name=svc_name, namespace=namespace)
        # 기존 서비스가 있으면 nodePort 읽어서 반환
        if svc.spec and svc.spec.ports and len(svc.spec.ports) > 0:
            return svc.spec.ports[0].node_port
        raise HTTPException(status_code=500, detail="서비스가 존재함, 근데 노드포트 없음")
    except ApiException as e:
        if e.status != 404:
            raise

    # 없으면 새로 만들기 (빈 nodePort 찾기)
    last_err = None
    for p in allowed_ports:
        try:
            svc = client.V1Service(
                metadata=client.V1ObjectMeta(
                    name=svc_name, 
                    labels=labels
                    ),
                spec=client.V1ServiceSpec(
                    type="NodePort",
                    selector={"key": labels["key"]}, # Deployment Pod 라벨의 Key와 일치
                    ports=[
                        client.V1ServicePort(
                            port=INTERNAL_NOVNC_PORT,
                            target_port=INTERNAL_NOVNC_PORT,
                            node_port=p,
                            protocol="TCP",
                        )
                    ],
                ),
            )
            v1.create_namespaced_service(namespace=namespace, body=svc)
            return p
        except ApiException as ex:
            last_err = ex
            if ex.status in (409, 422):
                continue
            raise

    raise HTTPException(status_code=500, detail=f"No available NodePort (last_err={getattr(last_err, 'reason', None)})")

"""Pod이름 알아내기"""
def get_any_running_pod_name(v1: client.CoreV1Api, namespace: str, key: str) -> str | None:
    pods = v1.list_namespaced_pod(namespace=namespace, label_selector=f"key={key}")
    for item in pods.items:
        if item.status and item.status.phase in ("Running", "Pending"):
            return item.metadata.name
    return None