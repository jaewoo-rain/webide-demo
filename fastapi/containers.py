# from fastapi import APIRouter, Depends, Query, HTTPException
# from sqlalchemy.orm import Session
# from sqlalchemy import text

# from app.core.db import get_db
# from app.core.config import settings
# from app.crud import project as crud
# from app.schemas.project import ProjectCreate, ProjectOut
# from app.services.k8s_service import create_container_k8s, delete_container_k8s
# from utils.util_create_project import slug

# router = APIRouter()

# @router.post("/containers", response_model=ProjectOut)
# def create_container(req: ProjectCreate, db: Session = Depends(get_db)):
#     owner = slug(req.user_name)
#     project = slug(req.project_name)
#     key = f"{owner}-{project}"

#     existed = crud.get_alive_by_key(db, key)
#     if existed:
#         return existed

#     k8s = create_container_k8s(settings.NAMESPACE, req.user_name, req.project_name, req.image)

#     obj = crud.create_project(db, {
#         "user_name_raw": req.user_name,
#         "project_name_raw": req.project_name,
#         "owner_slug": k8s["owner_slug"],
#         "project_slug": k8s["project_slug"],
#         "key": k8s["key"],
#         "namespace": k8s["namespace"],
#         "deploy_name": k8s["deploy_name"],
#         "svc_name": k8s["svc_name"],
#         "pvc_name": k8s["pvc_name"],
#         "image": req.image,
#     })
#     return obj

# @router.delete("/containers")
# def delete_container(
#     user_name: str = Query(...),
#     project_name: str = Query(...),
#     db: Session = Depends(get_db),
# ):
#     k8s = delete_container_k8s(settings.NAMESPACE, user_name, project_name)
#     ok = crud.soft_delete_by_key(db, k8s["key"])
#     return {"ok": True, **k8s, "db_deleted": ok}

# @router.get("/containers", response_model=list[ProjectOut])
# def list_containers(user_name: str = Query(...), db: Session = Depends(get_db)):
#     owner = slug(user_name)
#     return crud.list_by_owner(db, owner)

# # ---------------------------
# # ✅ "raw SQL로만 작성된 SELECT 예시" (요구사항)
# # ---------------------------
# @router.get("/containers/raw")
# def list_containers_raw_sql(user_name: str = Query(...), db: Session = Depends(get_db)):
#     owner = slug(user_name)

#     rows = db.execute(
#         text("""
#             SELECT id, user_name_raw, project_name_raw, owner_slug, project_slug, `key`,
#                    namespace, deploy_name, svc_name, pvc_name, image
#             FROM projects
#             WHERE owner_slug = :owner
#               AND deleted_at IS NULL
#             ORDER BY id DESC
#         """),
#         {"owner": owner},
#     ).mappings().all()

#     # mappings() => dict-like row
#     return {"items": [dict(r) for r in rows]}
