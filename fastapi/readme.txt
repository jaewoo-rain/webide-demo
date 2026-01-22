docker build -t jaewoo6257/ide-demo-fastapi:echo .
docker push jaewoo6257/ide-demo-fastapi:echo

적용
kubectl apply -f fastapi-deploy.yaml
kubectl apply -f fastapi-svc.yaml

확인
kubectl get pods
kubectl get svc
kubectl logs -l app=ide-fastapi -f

재시작
kubectl rollout restart deployment/ide-fastapi -n webide-net

삭제 확인 : 삭제되는데 오래 걸림
kubectl get deploy,rs,pod,svc,pvc -n webide-net | grep novnc || echo "novnc 리소스 없음"



---
webide-demo> 여기서 사용
docker build -t jaewoo6257/webide-react:1.0.7 .
docker build --no-cache -t jaewoo6257/webide-react:echo .

docker push jaewoo6257/webide-react:1.0.7

kubectl rollout restart deployment/webide-react -n webide-net
