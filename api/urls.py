from django.urls import path
from .views import (
    CiudadList, CiudadDetail, RefugioList, RefugioDetail,
    RegisterView, LoginView, LoginJob, UserList, UserListAdopcion,
    UserDetailView, EspecieList, EspecieDetail,
    RazaList, RazaDetail, PetList, PetDetail,
    DetalleDonacionList, DetalleDonacionDetail,
    DonacionList, DonacionDetail,
    AdoptanteList, AdoptanteDetail,
    DocumentoList, DocumentoDetail,
    ReunionList, ReunionDetail,
    FechaVisitaList, FechaVisitaDetail,
    AdminList, AdminDetail, EventosList,
    EventoDetail, ValidateTokenView,
    ContactoList, ContactoDetail
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('api/eventos/', EventosList.as_view(), name="Eventos-List"),
    path('api/eventos/<int:pk>/', EventoDetail.as_view(), name="Eventos-Detail"),
    path('api/validate-token/', ValidateTokenView.as_view(), name='validate-token'),

    path('api/contactos/<int:pk>/', ContactoDetail.as_view(), name="contacto-Detail"),
    path('api/contactos/', ContactoList.as_view(), name='Contacto-List'),
    
    path('api/ciudades/', CiudadList.as_view(), name='ciudad-list'),
    path('api/ciudades/<int:pk>/', CiudadDetail.as_view(), name='ciudad-detail'),

    path('api/refugios/', RefugioList.as_view(), name='refugio-list'),
    path('api/refugios/<int:pk>/', RefugioDetail.as_view(), name='refugio-detail'),

    path('api/users/adopcion', UserListAdopcion.as_view(), name='user-List-adopcion'),
    path('api/users/', UserList.as_view(), name='user-List'),
    path('api/users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/login-job/', LoginJob.as_view(), name='login-job'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/especies/', EspecieList.as_view(), name='especie-list'),
    path('api/especies/<int:pk>/', EspecieDetail.as_view(), name='especie-detail'),

    path('api/razas/', RazaList.as_view(), name='raza-list'),
    path('api/razas/<int:pk>/', RazaDetail.as_view(), name='raza-detail'),

    path('api/pets/', PetList.as_view(), name='pet-list'),
    path('api/pets/<int:pk>/', PetDetail.as_view(), name='pet-detail'),

    path('api/detalle-donaciones/', DetalleDonacionList.as_view(), name='detalle-donacion-list'),
    path('api/detalle-donaciones/<int:pk>/', DetalleDonacionDetail.as_view(), name='detalle-donacion-detail'),

    path('api/donaciones/', DonacionList.as_view(), name='donacion-list'),
    path('api/donaciones/<int:pk>/', DonacionDetail.as_view(), name='donacion-detail'),

    path('api/adoptantes/', AdoptanteList.as_view(), name='adoptante-list'),
    path('api/adoptantes/<int:pk>/', AdoptanteDetail.as_view(), name='adoptante-detail'),

    path('api/documentos/', DocumentoList.as_view(), name='documento-list'),
    path('api/documentos/<int:pk>/', DocumentoDetail.as_view(), name='documento-detail'),

    path('api/reuniones/', ReunionList.as_view(), name='reunion-list'),
    path('api/reuniones/<int:pk>/', ReunionDetail.as_view(), name='reunion-detail'),

    path('api/fechas-visita/', FechaVisitaList.as_view(), name='fecha-visita-list'),
    path('api/fechas-visita/<int:pk>/', FechaVisitaDetail.as_view(), name='fecha-visita-detail'),
    
    path('api/admins/', AdminList.as_view(), name='admin-list'),
    path('api/admins/<int:pk>/', AdminDetail.as_view(), name='admin-detail'),
]