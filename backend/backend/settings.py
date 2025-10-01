# This code snippet is a configuration file for a Django project. It includes settings related to the
# project such as database configuration, installed apps, middleware, authentication settings,
# internationalization settings, static files configuration, REST framework settings, and more.


from pathlib import Path
from datetime import timedelta
# Build paths inside the project like this: BASE_DIR / 'subdir'.

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = 'django-insecure-jrc&=$q!__wzyqp4n40^*)3s97efwfb0zr%)@y#tsp*vg4=$=n'


DEBUG = True

ALLOWED_HOSTS = []


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'users',
    "corsheaders",
    "api",
    'parler',            
    'language',  
    'alldepartments',
    "products.apps.ProductsConfig", 
    "company",  
    "rest_framework_simplejwt.token_blacklist",
    "party_type",
    "booking",
    "sr",
    "pallot",
    "loan",
    "essential_settings","accounts",
    
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
   
]

# React origin allow করুন (আপনার পোর্ট ঠিক করুন)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite (React) default
]
CORS_ALLOW_CREDENTIALS = True

# CSRF ট্রাস্টেড (React origin)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
]

# ডেভেলপমেন্টে সহজ রাখতে:
CSRF_COOKIE_HTTPONLY = False  # JS থেকে csrftoken পড়তে হলে False দরকার

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
       'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'software_project4',       # তোমার DB নাম
        'USER': 'postgres',   # DB ইউজার
        # 'PASSWORD': '1234', # পাসওয়ার্ড
        'PASSWORD': '5843', # পাসওয়ার্ড 
        'HOST': 'localhost',
        'PORT': '5432',
    }
}


# Parler settings
PARLER_LANGUAGES = {
    None: (
        {'code': 'en'},
        {'code': 'bn'},
    ),
    'default': {
        'fallback': 'en',
        'hide_untranslated': False,
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),   # Access token 1 দিন থাকবে
    "REFRESH_TOKEN_LIFETIME": timedelta(days=2),  # Refresh token 7 দিন থাকবে
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


AUTH_USER_MODEL = "users.CustomUser"



# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'




REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # গ্লোবাল পারমিশন ওপেন রাখলাম; ভিউ লেভেলে প্রটেক্ট করব
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}


MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

