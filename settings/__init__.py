from settings.default import *

try:
    from settings.local import *
except ImportError:
    from settings.server import *
