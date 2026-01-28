from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from datetime import datetime
from repository.models.project import Project

# 프로젝트 조회
def get_alive_by_key(db: Session, key: str) -> Project | None:
    return db.execute(
        select(Project).where(Project.key == key, Project.deleted_at.is_(None))
    ).scalar_one_or_none()

# owner가 가진 살아있는 프로젝트 목록 조회
def list_by_owner(db: Session, owner_slug: str) -> list[Project]:
    return list(
        db.execute(
            select(Project).where(Project.owner_slug == owner_slug, Project.deleted_at.is_(None))
            .order_by(Project.id.desc())
        ).scalars().all()
    )

# 프로젝트 생성
def create_project(db: Session, data: dict) -> Project:
    obj = Project(**data)
    db.add(obj)
    db.flush() # id 생성
    db.refresh(obj)
    return obj

# 프로젝트 삭제 표시
def soft_delete_by_key(db: Session, key: str) -> bool:
    obj = get_alive_by_key(db, key)
    if not obj:
        return False
    obj.deleted_at = datetime.utcnow()
    db.flush()
    return True

# 프로젝트 진짜 삭제
def hard_delete_by_key(db: Session, key: str) -> bool:
    """
    projects 테이블에서 해당 key 행을 진짜로 삭제(DELETE)한다.
    - 삭제된 행이 있으면 True
    - 없으면 False
    """
    result = db.execute(
        delete(Project).where(Project.key == key)
    )
    # result.rowcount: 실제로 삭제된 행 개수
    return (result.rowcount or 0) > 0