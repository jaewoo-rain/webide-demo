docker build -t jaewoo2/ide-demo-fastapi:echo .
docker push jaewoo2/ide-demo-fastapi:echo

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

서비스 변경


---
webide-demo> 여기서 사용
docker build -t jaewoo2/webide-react:1.2.10 .
docker build --no-cache -t jaewoo6257/webide-react:echo .

docker push jaewoo2/webide-react:1.2.10 

kubectl rollout restart deployment/webide-react -n webide-netㅀ

kubectl apply -f react.yaml 
----

mysql
kubectl apply -f mysql-all.yaml

확인
kubectl get all -n webide-net | grep mysql
kubectl logs deploy/mysql -n webide-net

재시작
kubectl rollout restart deployment/mysql -n webide-net

데이터 삭제
kubectl delete pvc mysql-pvc -n webide-net
kubectl rollout restart deployment/mysql -n webide-net

완전 삭제
kubectl delete deployment mysql -n webide-net
kubectl delete service mysql -n webide-net
kubectl delete pvc mysql-pvc -n webide-net
kubectl delete secret mysql-secret -n webide-net
kubectl apply -f mysql-all-in-one.yaml

로그
kubectl logs deploy/mysql -n webide-net
