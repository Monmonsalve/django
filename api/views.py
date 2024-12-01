from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.core.mail import EmailMultiAlternatives

from .models import (
    Ciudad, Refugio, User, Especie, Raza,
    Pet, DetalleDonacion, Donacion, Adoptante,
    Documento, Reunion, FechaVisita, Admin, eventos, contacto
)
from .serializers import (
    CiudadSerializer, RefugioSerializer, UserSerializer,
    EspecieSerializer, RazaSerializer, PetSerializer,
    DetalleDonacionSerializer, DonacionSerializer,
    AdoptanteSerializer, DocumentoSerializer,
    ReunionSerializer, FechaVisitaSerializer, AdminSerializer,
    EventosSerializer, ContactoSerializer
)

#View Contacto
class ContactoList(generics.ListCreateAPIView):
    serializer_class = ContactoSerializer

    def get_queryset(self):
        # Filtrar contactos cuyo estado sea False
        return contacto.objects.filter(estado=False)

class ContactoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = contacto.objects.all()
    serializer_class = ContactoSerializer

    def perform_update(self, serializer):
        # Actualiza el contacto en la base de datos
        user = serializer.save()

        # Obtén los datos enviados desde el frontend
        nombre = self.request.data.get('nombre')
        email = self.request.data.get('email')
        message = self.request.data.get('message')

        # Verifica si el mensaje está presente
        if message and nombre and email:
            # Crear el correo
            subject = 'Respuesta a tu consulta en Huella Animal'
            from_email = 'agrupcolitasfelices@gmail.com'
            to = email

            # Cuerpo del correo en formato HTML usando el nombre del usuario y el mensaje
            html_content = f"""
            <html>
                <body>
                    <p>Estimado {nombre},</p>
                    <br/>
                    <p>Junto con saludar, me comunico con usted para poder responder su duda y ayudarlo.</p>
                    <br/>
                    <p> {message}</p>
                    <p>Si tienes alguna otra consulta, no dudes en escribirnos.</p>
                    <p>Atte,<br><strong>Huella Animal</strong></p>
                </body>
            </html>
            """

            # Enviar el correo al usuario con el mensaje
            email_obj = EmailMultiAlternatives(subject, '', from_email, [to])
            email_obj.attach_alternative(html_content, 'text/html')
            email_obj.send()

        return user

#Views Eventos
class EventosList(generics.ListCreateAPIView):
    serializer_class = EventosSerializer

    def get_queryset(self):
        return eventos.objects.filter(disponibilidad= True)

class EventoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = eventos.objects.all()
    serializer_class = EventosSerializer

# Views para Ciudad
class CiudadList(generics.ListCreateAPIView):
    queryset = Ciudad.objects.all()
    serializer_class = CiudadSerializer

class CiudadDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ciudad.objects.all()
    serializer_class = CiudadSerializer

# Views para Refugio
class RefugioList(generics.ListCreateAPIView):
    queryset = Refugio.objects.all()
    serializer_class = RefugioSerializer

class RefugioDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Refugio.objects.all()
    serializer_class = RefugioSerializer

class ValidateTokenView(APIView):
    permission_classes = [IsAuthenticated]  # Solo los usuarios autenticados pueden acceder a esta vista

    def get(self, request):
        # Si el token es válido, devolverá 200 OK
        return Response({"message": "Token válido"}, status=status.HTTP_200_OK)

# Views para User
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()

        # Crear el correo
        subject = '¡Bienvenido a Huella Animal!'
        from_email = 'agrupcolitasfelices@gmail.com'  # Cambia esto por tu dirección de correo
        to = user.email

        # Cuerpo del correo en formato HTML
        html_content = f"""
        <html>
            <body>
                <h2>Hola {user.nombre},</h2>
                <p>¡Gracias por registrarte en Huella Animal! Estamos encantados de tenerte en nuestra comunidad dedicada a ayudar a nuestros amigos de cuatro patas.</p>
                <h3>¿Por qué es tan importante adoptar?</h3>
                <p>La adopción de mascotas no solo les da una segunda oportunidad a aquellos animales que han sido abandonados o maltratados, 
                sino que también ayuda a reducir el número de animales en refugios. Cada adopción significa una vida salvada y una oportunidad para que un animal encuentre un hogar lleno de amor.</p>
                <p>En Huella Animal, trabajamos incansablemente para promover la adopción responsable y educar a la comunidad sobre la importancia de cuidar a nuestras mascotas. Juntos, podemos hacer una gran diferencia.</p>
                <p>Gracias nuevamente por unirte a nosotros. ¡Estamos emocionados de contar contigo en esta noble causa!</p>
                <p>Con cariño,<br><strong>Huella Animal</strong></p>
            </body>
        </html>
        """

        # Enviar el correo
        email = EmailMultiAlternatives(subject, '', from_email, [to])
        email.attach_alternative(html_content, 'text/html')  # Adjuntar contenido HTML
        email.send()


User = get_user_model()

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            # Intentamos obtener al usuario con el email proporcionado
            user = User.objects.get(email=email)

            # Verificamos que el usuario no sea un superusuario
            if user.is_superuser:
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

            # Verificamos que la contraseña ingresada sea correcta
            if user.check_password(password):
                # Generamos el token para este usuario
                refresh = RefreshToken.for_user(user)

                # Devolvemos el token y los datos específicos del usuario
                return Response({
                    'token': str(refresh.access_token),
                    'nombre': user.nombre,
                    'apellidos': user.apellidos,
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
            else:
                # Si la contraseña no es correcta, se devuelve un error de autenticación
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            # Si el usuario no existe, también se devuelve un error de autenticación
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


User = get_user_model()

class LoginJob(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                # Verificar si el usuario es un superusuario
                if user.is_superuser:
                    # Generar token
                    refresh = RefreshToken.for_user(user)

                    return Response({
                        'token': str(refresh.access_token),
                        'id_user': user.id_user,
                        'last_login': user.last_login,
                        'is_superuser': user.is_superuser,
                        'rut': user.rut,
                        'nombre': user.nombre,
                        'apellidos': user.apellidos,
                        'email': user.email,
                        'direccion': user.direccion,
                        'telefono': user.telefono,
                        'ultimo_login': user.last_login,
                        'esta_activa': user.is_active,
                        'groups': [group.name for group in user.groups.all()],
                        'user_permissions': [perm.codename for perm in user.user_permissions.all()],
                        'message': 'Admin login successful'
                    }, status=status.HTTP_200_OK)
                else:
                    # Si el usuario no es superusuario, no devolver nada
                    return Response({'error': 'Unauthorized - Only admin users can access this endpoint'}, 
                                    status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class UserList(generics.ListCreateAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user  # Obtenemos el usuario autenticado

        # Filtramos por email si se proporciona en los parámetros de consulta
        email = self.request.query_params.get('email', None)
        if email:
            return User.objects.filter(email=email)
        return User.objects.all()

class UserListAdopcion(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]  # Requiere autenticación

    def get(self, request):
        # Obtener el usuario basado en el token JWT
        user = request.user
        # Retornar la información del usuario
        return Response({
            'id_user': user.id,
            'nombre': user.nombre,
            'apellidos': user.apellidos,
            'email': user.email,
            'is_superuser': user.is_superuser,
            'message': 'User details retrieved successfully'
        })
    
# Views para Especie
class EspecieList(generics.ListCreateAPIView):
    queryset = Especie.objects.all()
    serializer_class = EspecieSerializer

class EspecieDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Especie.objects.all()
    serializer_class = EspecieSerializer

# Views para Raza
class RazaList(generics.ListCreateAPIView):
    serializer_class = RazaSerializer

    def get_queryset(self):
        queryset = Raza.objects.all()
        id_especie = self.request.query_params.get('id_especie', None)
        if id_especie is not None:
            queryset = queryset.filter(id_especie=id_especie)
        return queryset

class RazaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Raza.objects.all()
    serializer_class = RazaSerializer

# Views para Pet
class PetList(generics.ListCreateAPIView):  # Cambia ListAPIView a ListCreateAPIView
    queryset = Pet.objects.all()
    serializer_class = PetSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        especie_id = self.request.query_params.get('id_especie', None)
        if especie_id is not None:
            queryset = queryset.filter(id_especie=especie_id)
        return queryset

class PetDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pet.objects.all()
    serializer_class = PetSerializer

    
# Views para DetalleDonacion
class DetalleDonacionList(generics.ListCreateAPIView):
    serializer_class = DetalleDonacionSerializer

    def get_queryset(self):
        queryset = DetalleDonacion.objects.all()
        id_donacion = self.request.query_params.get('id_donacion', None)
        if id_donacion is not None:
            queryset = queryset.filter(id_donacion=id_donacion)
        return queryset

class DetalleDonacionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DetalleDonacion.objects.all()
    serializer_class = DetalleDonacionSerializer

# Views para Donacion
class DonacionList(generics.ListCreateAPIView):
    serializer_class = DonacionSerializer

    def get_queryset(self):
        queryset = Donacion.objects.all()
        id_user = self.request.query_params.get('id_user', None)
        if id_user is not None:
            queryset = queryset.filter(id_user=id_user)
        return queryset

class DonacionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donacion.objects.all()
    serializer_class = DonacionSerializer

# Views para Adoptante
from rest_framework import generics
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import Adoptante
from .serializers import AdoptanteSerializer

from rest_framework import generics
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import Adoptante
from .serializers import AdoptanteSerializer

class AdoptanteList(generics.ListCreateAPIView):
    queryset = Adoptante.objects.all()
    serializer_class = AdoptanteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        id_user = self.request.query_params.get('id_user', None)
        
        if id_user is not None:
            queryset = queryset.filter(id_user=id_user)
        
        return queryset

    def create(self, request, *args, **kwargs):
        # Llama al método de creación de la clase base
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Obtener el email del localStorage desde el request
        email_usuario = request.data.get('email_usuario')  # Espera que el email se envíe desde el cliente

        if email_usuario:
            self.enviar_email(serializer.instance, email_usuario)

        # Devuelve la respuesta de la creación
        return Response(serializer.data, status=201)

    def enviar_email(self, adoptante, email_usuario):
        subject = 'Bienvenido al Proceso de adopcion'
        from_email = 'agrupcolitasfelices@gmail.com'  # Cambia esto por tu dirección de correo

        # Cuerpo del correo en formato HTML
        html_content = f"""
        <html>
            <body>
                <h2>Hola </h2>
                <p>Tu formulario como adoptante ha sido exitoso. Queremos agradecerte por tomar esta importante decisión y por unirte a nuestra comunidad.</p>
                <p>Esperamos que puedas cumplir con el proceso de adopción con éxito y que brindes un hogar lleno de amor a un animal que lo necesita.</p>
                <p>Nos estaremos comunicando contigo para coordinar la reunión de adopción. Además, te informaremos por mensaje si has aprobado el proceso o si hay algún inconveniente.</p>
                <p>Gracias nuevamente por tu interés y compromiso. ¡Te deseamos lo mejor en este camino de adopción!</p>
                <p>Con cariño,<br><strong>Huella Animal</strong></p>
            </body>
        </html>
        """

        # Enviar el correo
        email = EmailMultiAlternatives(subject, '', from_email, [email_usuario])
        email.attach_alternative(html_content, 'text/html')  # Adjuntar contenido HTML
        email.send()


class AdoptanteDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Adoptante.objects.all()
    serializer_class = AdoptanteSerializer

    def perform_update(self, serializer):
        adopcion = serializer.save()

        # Verificar el estado actualizado
        if adopcion.estados == 'Aprobado':
            self.enviar_correo_adopcion_aprobada(adopcion)
        elif adopcion.estados == 'Negado':
            self.enviar_correo_adopcion_denegada(adopcion)

    def enviar_correo_adopcion_aprobada(self, adopcion):
        user = adopcion.id_user
        mascota = adopcion.id_pets

        subject = '¡Felicidades! Tu adopción ha sido aprobada'
        from_email = 'agrupcolitasfelices@gmail.com'
        to = user.email

        html_content = f"""
        <html>
            <body>
                <h2>Hola {user.nombre} {user.apellidos},</h2>
                <p>¡Felicidades! Tu solicitud para adoptar a {mascota.nombre} ha sido aprobada.</p>
                <p>Estamos encantados de que {mascota.nombre} haya encontrado un hogar lleno de amor contigo.</p>
                <h3>¿Qué sigue ahora?</h3>
                <p>Nuestro equipo se pondrá en contacto contigo para coordinar los detalles finales del proceso de adopción.</p>
                <p>Gracias por tu compromiso de ofrecer una vida mejor a un animal necesitado.</p>
                <p>Con cariño,<br><strong>Huella Animal</strong></p>
            </body>
        </html>
        """
        self.enviar_correo(subject, html_content, to)

    def enviar_correo_adopcion_denegada(self, adopcion):
        user = adopcion.id_user
        mascota = adopcion.id_pets

        subject = 'Estado adopcion de ' + mascota.nombre + " Ha sido denegada"
        from_email = 'agrupcolitasfelices@gmail.com'
        to = user.email

        html_content = f"""
        <html>
            <body>
                <p>Estimado {user.nombre} {user.apellidos}</p>
                <p>Lamentamos informarte que tu solicitud para adoptar a {mascota.nombre} no ha sido aprobada en esta ocasión.</p>
                <p><strong>¿Por qué podría haber sido negada tu solicitud?</strong><p>
                <p>Nuestro equipo revisa cuidadosamente cada solicitud para asegurar que cada mascota sea ubicada en un entorno adecuado. 
                Puede haber varios factores que influenciaron esta decisión. Te animamos a que sigas intentando y nos contactes si tienes alguna duda.</p>
                <p>Gracias por tu interés en adoptar y por tu compromiso hacia los animales.</p>
                <p>Atte<br><strong>Huella Animal</strong></p>
            </body>
        </html>
        """
        self.enviar_correo(subject, html_content, to)

    def enviar_correo(self, subject, html_content, to):
        try:
            email = EmailMultiAlternatives(subject, '', 'agrupcolitasfelices@gmail.com', [to])
            email.attach_alternative(html_content, 'text/html')
            email.send()
            print(f"Correo enviado a {to}")
        except Exception as e:
            print(f"Error al enviar el correo: {e}")

class DocumentoList(generics.ListCreateAPIView):
    serializer_class = DocumentoSerializer

    def get_queryset(self):
        # Obtener el parámetro id_adoptante desde la consulta
        id_adoptante = self.request.query_params.get('id_adoptante', None)
        
        # Verificar si el id_adoptante se proporciona
        if id_adoptante is not None:
            try:
                # Filtrar los documentos por id_adoptante
                return Documento.objects.filter(id_adoptante=id_adoptante)
            except Documento.DoesNotExist:
                # Si no se encuentra ningún documento, devolver un mensaje adecuado
                return Documento.objects.none()  # No devolver nada si no se encuentra el adoptante
        return Documento.objects.all()

    def list(self, request, *args, **kwargs):
        # Obtener el queryset filtrado
        queryset = self.get_queryset()
        if not queryset:
            return Response({"mensaje": "No se encontraron documentos"}, status=status.HTTP_404_NOT_FOUND)

        # Serializar los datos
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class DocumentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer

# Views para Reunion
class ReunionList(generics.ListCreateAPIView):
    queryset = Reunion.objects.all()
    serializer_class = ReunionSerializer

class ReunionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reunion.objects.all()
    serializer_class = ReunionSerializer

# Views para FechaVisita
class FechaVisitaList(generics.ListCreateAPIView):
    queryset = FechaVisita.objects.all()
    serializer_class = FechaVisitaSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        id_user = self.request.query_params.get('id_user', None)
        if id_user is not None:
            queryset = queryset.filter(id_user=id_user)
        return queryset

class FechaVisitaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FechaVisita.objects.all()
    serializer_class = FechaVisitaSerializer

    # Función que se ejecuta al actualizar una visita
    def update(self, request, *args, **kwargs):
        # Obtén la instancia de la visita que se está actualizando
        instancia = self.get_object()

        # Extraemos los datos de la solicitud de actualización
        hora_visita = request.data.get('hora_visita')

        # Realizamos la actualización de la hora y la fecha
        instancia.hora_visita = hora_visita
        instancia.save()

        # Ahora enviamos el correo de confirmación al usuario
        self.enviar_correo_confirmacion(instancia)

        # Responder con los datos actualizados
        return Response(self.get_serializer(instancia).data, status=status.HTTP_200_OK)

    def enviar_correo_confirmacion(self, visita):
        user = visita.id_user
        mascota = visita.id_pets

        subject = '¡Gracias por agendar la visita!'
        from_email = 'agrupcolitasfelices@gmail.com'
        to = user.email

        html_content = f"""
        <html>
            <body>
                <p>Estimado {user.nombre} {user.apellidos}</p>
                <p>Te agradecemos por tu paciencia mientras procesamos tu solicitud. Tu visita ha sido agendada con éxito.</p>
                <p><strong>Detalles de la Visita:</strong></p>
                <ul>
                    <li><strong>Fecha de Visita:</strong> {visita.fecha_visita}</li>
                    <li><strong>Hora de Visita:</strong> {visita.hora_visita}</li>
                    <li><strong>Nombre de Mascota:</strong> {mascota.nombre}</li>
                </ul>
                <p>Estamos emocionados de que puedas conocer a {mascota.nombre} en la fecha y hora indicada.</p>
                <p>Si tienes alguna duda o necesitas realizar cambios en la cita, no dudes en contactarnos.</p>
                <p>¡Nos vemos pronto!</p>
                <p>Con cariño,<br><strong>Huella Animal</strong></p>
            </body>
        </html>
        """
        self.enviar_correo(subject, html_content, to)

    def enviar_correo(self, subject, html_content, to):
        try:
            email = EmailMultiAlternatives(subject, '', 'agrupcolitasfelices@gmail.com', [to])
            email.attach_alternative(html_content, 'text/html')
            email.send()
            print(f"Correo enviado a {to}")
        except Exception as e:
            print(f"Error al enviar el correo: {e}")

# Views para Admin
class AdminList(generics.ListCreateAPIView):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer

class AdminDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer