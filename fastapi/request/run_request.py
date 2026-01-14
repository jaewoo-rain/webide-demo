from pydantic import BaseModel

class RunRequest(BaseModel):
    code: str
    pod_name: str
    # projectName: str
    # vnc_url: str
    # ws_url: str