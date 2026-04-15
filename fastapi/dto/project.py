from pydantic import BaseModel

class RenameFileRequest(BaseModel):
    key: str
    old_relative_path: str
    new_relative_path: str
    base_path: str = "/opt/workspace"

class DeleteFileRequest(BaseModel):
    key: str
    relative_path: str
    base_path: str = "/opt/workspace"


class CreateFolderRequest(BaseModel):
    key: str
    relative_path: str
    base_path: str = "/opt/workspace"
