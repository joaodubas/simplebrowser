import os

here = lambda *x: os.path.join(os.path.abspath(os.path.dirname(__file__)), *x)

ROOT = here('..')
join_root = lambda *x: os.path.join(ROOT, *x)

PROJECT_NAME = '.'.join(__name__.split('.')[:-2]) # cut .settings

DEBUG = False
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('DUBAS, Joao Paulo', 'joao.dubas@gmail.com'),
)

MANAGERS = ADMINS

TIME_ZONE = 'America/Sao_Paulo'

LANGUAGE_CODE = 'pt-br'

SITE_ID = 1

USE_I18N = True
USE_L10N = True

MEDIA_ROOT = join_root('media', 'upload')
MEDIA_URL = '/upload/'

STATIC_ROOT = join_root('media', 'assets')
STATIC_URL = '/static/'
ADMIN_MEDIA_PREFIX = '%s%s/' % (STATIC_URL, 'admin')

STATICFILES_DIRS = (
    join_root('static'),
)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

SECRET_KEY = 'xs79*zpu_bmgq$5pulmi*!$b1o*#6+svg_iqb)xut9656)p-s+'

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'settings.urls'

TEMPLATE_DIRS = (
    join_root('templates')
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

TEST_EXCLUDE = ('django',)
TEST_RUNNER = 'settings.test_suite.AdvancedTestSuiteRunner'

