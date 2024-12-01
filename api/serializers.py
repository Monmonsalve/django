from rest_framework import serializers
from .models import contacto, Ciudad, Refugio, User, Especie, Raza, Pet, DetalleDonacion, Donacion, Adoptante, Documento, Reunion, FechaVisita, Admin, eventos

class ContactoSerializer(serializers.ModelSerializer):
    class Meta:
        model = contacto
        fields = '__all__'

class EventosSerializer(serializers.ModelSerializer):
    class Meta:
        model = eventos
        fields = '__all__'

    def update(self, instance, validated_data):
        # Actualizar campos modificados
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class CiudadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ciudad
        fields = '__all__'

class RefugioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refugio
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(**validated_data)
        user.save()
        return user

class EspecieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especie
        fields = '__all__'

class RazaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Raza
        fields = '__all__'

class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = '__all__'

class DetalleDonacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleDonacion
        fields = '__all__'

class DonacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donacion
        fields = '__all__'

class AdoptanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adoptante
        fields = '__all__'

class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = '__all__'

class ReunionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reunion
        fields = '__all__'

class FechaVisitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FechaVisita
        fields = '__all__'

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'