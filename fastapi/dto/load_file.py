from pydantic import BaseModel
from typing import Dict, List, Optional

class LoadFileRequest(BaseModel):
    pod_name: str


class FileNode(BaseModel):
    id: str
    type: str
    children: Optional[List['FileNode']] = None

class FileMapItem(BaseModel):
    name: str
    content: Optional[str] = None
    type: str
    path: Optional[str] = None
    
class LoadFileResponse(BaseModel):
    tree: FileNode
    fileMap: Dict[str, FileMapItem]














