docker build -t jaewoo6257/ide-demo-fastapi:echo .
docker push jaewoo6257/ide-demo-fastapi:echo

적용
kubectl apply -f fastapi-deploy.yaml
kubectl apply -f fastapi-svc.yaml

확인
kubectl get pods
kubectl get svc
kubectl logs -l app=ide-fastapi -f