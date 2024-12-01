from django.db import models
import os
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class Ciudad(models.Model):
    id_ciudad = models.AutoField(primary_key=True)
    ciudad = models.CharField(max_length=100)

    class Meta:
        db_table = 'ciudad'

class Refugio(models.Model):
    #VCampos numericos
    id_refugio = models.AutoField(primary_key=True)
    id_ciudad = models.ForeignKey(Ciudad, on_delete=models.CASCADE, null=True, blank=True)
    #Campos de texto
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=15, blank=True)

    class Meta:
        db_table = 'refugio'

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El Email debe ser establecido')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Almacena la contraseña de forma segura
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('esta_activa', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    # Campos numéricos
    id_user = models.AutoField(primary_key=True)
    rut = models.CharField(max_length=12, unique=True)
    
    # Campos de texto
    nombre = models.CharField(max_length=50)
    apellidos = models.CharField(max_length=50)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=15, blank=True)
    
    # Campo de fecha
    ultimo_login = models.DateTimeField(auto_now=True, null=True)
    
    # Campo booleano
    esta_activa = models.BooleanField(default=True)

    # Configuración del modelo
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['rut', 'nombre', 'apellidos']  # Campos requeridos para el superusuario

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def save(self, *args, **kwargs):
        if self.password:
            self.password = make_password(self.password)  # Asegura que la contraseña se guarde hasheada
        super().save(*args, **kwargs)

class Especie(models.Model):
    id_especie = models.AutoField(primary_key=True)
    especie = models.CharField(max_length=100)

class Raza(models.Model):
    #Campos Numericos
    id_raza = models.AutoField(primary_key=True)
    id_especie = models.ForeignKey(Especie, on_delete=models.CASCADE, null=True, blank=True)
    #campo de texto
    raza = models.CharField(max_length=100)

class Pet(models.Model):
    #Campos Numericos
    id_pets = models.AutoField(primary_key=True)
    id_especie = models.ForeignKey(Especie, on_delete=models.CASCADE,null=True, blank=True)
    id_raza = models.ForeignKey(Raza, on_delete=models.CASCADE, null=True, blank=True)
    id_refugio = models.ForeignKey(Refugio, on_delete=models.CASCADE, null=True, blank=True)
    edad = models.IntegerField(blank=True, null=True)
    ##Campos de texto
    nombre = models.CharField(max_length=50)
    sexo = models.CharField(max_length=10, blank=True)
    descripcion = models.TextField(blank=True)
    comentario = models.TextField(blank=True)
    #Campos de fecha
    fecha_llegada = models.DateField()
    #campo Booleano
    disponibilidad = models.BooleanField(default=True)
    #campo Imagenes
    img = models.ImageField(upload_to='animales')

    class Meta:
        db_table = 'pets'

class Donacion(models.Model):
    #Campos Numericos
    id_donacion = models.AutoField(primary_key=True)
    id_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    #Campos de Texto
    tipo_donacion = models.CharField(max_length=50)
    message = models.TextField(blank=True)
    #Campo de Fecha
    fecha_donacion = models.DateField()
    class Meta:
        db_table = 'donaciones'

class DetalleDonacion(models.Model):
    #Campos Numericos
    id_donacion = models.ForeignKey(Donacion, on_delete=models.CASCADE, null=True, blank=True)
    id_detalleDonacion = models.AutoField(primary_key=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    #campos de Textos
    detalle = models.TextField(blank=True)
    tipoTarjeta = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'detalle_donacion'



class Adoptante(models.Model):
    #Campos Numericos
    id_adoptante = models.AutoField(primary_key=True)
    id_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    id_pets = models.ForeignKey(Pet, on_delete=models.CASCADE, null=True, blank=True)
    #campos de Fecha
    fecha_adopcion = models.DateField()
    # Campos con opciones
    OPCIONES = [
        ('Proceso', 'En Proceso'),
        ('Negado', 'Adopacion Fallido'),
        ('Aprobado', 'Adopcion Aprobada'),
    ]
    estados = models.CharField(max_length=30, choices=OPCIONES, default='Proceso')

    class Meta:
        db_table = 'adoptante'


def document_upload_to(instance, filename):
    base, ext = os.path.splitext(filename)
    # Usar instance.id_adoptante para acceder a los datos del adoptante
    user_name = f"{instance.id_adoptante.id_user}_{instance.id_adoptante.id_pets}"  
    unique_filename = f"{user_name}{ext}"  # Nombre de archivo único
    return f'documentos/{unique_filename}'

class Documento(models.Model):
    id_documento = models.AutoField(primary_key=True)
    documento = models.FileField(upload_to=document_upload_to)
    id_adoptante = models.ForeignKey(Adoptante, on_delete=models.CASCADE, null=True, blank=True)

    OPCIONES_DOCUMENTOS = [
        ('Proceso', 'En Proceso'),
        ('Negado', 'Documento Fallido'),
        ('Aprobado', 'Documento Aprobado'),
    ]
    
    estado_documento = models.CharField(max_length=30, choices=OPCIONES_DOCUMENTOS, default='Proceso')

    class Meta:
        db_table = 'documentos'

class Reunion(models.Model):
    #campo numericos
    id_reunion = models.AutoField(primary_key=True)
    id_adoptante = models.ForeignKey(Adoptante, on_delete=models.CASCADE, null=True, blank=True)
    #Campo Texto
    message = models.TextField(blank=True)
    link_reunion = models.CharField(max_length=255, blank=True)
    email_cliente = models.EmailField(max_length=100, blank=True)
    #campos de Fecha
    fecha_reunion = models.DateField()
    hora_reunion = models.TimeField()

    class Meta:
        db_table = 'reuniones'


class FechaVisita(models.Model):
    id_visita = models.AutoField(primary_key=True)
    fecha_visita = models.DateField()
    hora_visita = models.TimeField(null=True,blank=True)
    id_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    id_pets = models.ForeignKey(Pet, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'fecha_visitas'


class Admin(models.Model):
    id_admin = models.AutoField(primary_key=True)
    id_refugio = models.ForeignKey(Refugio, on_delete=models.CASCADE, null=True, blank=True)
    rut = models.CharField(max_length=12, unique=True)
    nombre = models.CharField(max_length=50)
    apellidos = models.CharField(max_length=50)
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=255)
    telefono = models.CharField(max_length=15, blank=True)

    # Campos con opciones
    OPCIONES_ROL = [
        ('admin', 'Administrador'),
    ]
    rol = models.CharField(max_length=7, choices=OPCIONES_ROL, default='usuario')

    class Meta:
        db_table = 'admin'

class eventos(models.Model):
    id_evento = models.AutoField(primary_key=True)
    imagen = models.ImageField(upload_to='eventos')
    titulo = models.CharField(max_length=100, blank=True)
    descripcion = models.CharField(max_length=2000, blank= True)
    disponibilidad = models.BooleanField(default=True, blank=True)

class contacto(models.Model):
    id_contacto = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, blank=True)
    email = models.EmailField(max_length=100)
    asunto = models.CharField(max_length=50, blank=True)
    mensaje = models.CharField(max_length=500, blank=True)
    telefono = models.CharField(max_length=30, blank=True)
    estado = models.BooleanField(default=False)

    class Meta:
        db_table = 'contacto'