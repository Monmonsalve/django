# Generated by Django 5.1 on 2024-10-24 06:16

import api.models
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Adoptante',
            fields=[
                ('id_adoptante', models.AutoField(primary_key=True, serialize=False)),
                ('fecha_adopcion', models.DateField()),
                ('estados', models.CharField(choices=[('Proceso', 'En Proceso'), ('Negado', 'Adopacion Fallido'), ('Aprobado', 'Adopcion Aprobada')], default='Proceso', max_length=30)),
            ],
            options={
                'db_table': 'adoptante',
            },
        ),
        migrations.CreateModel(
            name='Ciudad',
            fields=[
                ('id_ciudad', models.AutoField(primary_key=True, serialize=False)),
                ('ciudad', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'ciudad',
            },
        ),
        migrations.CreateModel(
            name='DetalleDonacion',
            fields=[
                ('id_detalleDonacion', models.AutoField(primary_key=True, serialize=False)),
                ('monto', models.DecimalField(decimal_places=2, max_digits=10)),
                ('detalle', models.TextField(blank=True)),
                ('tipoTarjeta', models.CharField(blank=True, max_length=50)),
            ],
            options={
                'db_table': 'detalle_donacion',
            },
        ),
        migrations.CreateModel(
            name='Especie',
            fields=[
                ('id_especie', models.AutoField(primary_key=True, serialize=False)),
                ('especie', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id_user', models.AutoField(primary_key=True, serialize=False)),
                ('rut', models.CharField(max_length=12, unique=True)),
                ('nombre', models.CharField(max_length=50)),
                ('apellidos', models.CharField(max_length=50)),
                ('email', models.EmailField(max_length=100)),
                ('password', models.CharField(max_length=255)),
                ('direccion', models.CharField(blank=True, max_length=255)),
                ('telefono', models.CharField(blank=True, max_length=15)),
                ('ultimo_login', models.DateTimeField(auto_now=True, null=True)),
                ('esta_activa', models.BooleanField(default=True)),
            ],
            options={
                'db_table': 'users',
            },
        ),
        migrations.CreateModel(
            name='Documento',
            fields=[
                ('id_documento', models.AutoField(primary_key=True, serialize=False)),
                ('documento', models.FileField(upload_to=api.models.document_upload_to)),
                ('estado_documento', models.CharField(choices=[('Proceso', 'En Proceso'), ('Negado', 'Documento Fallido'), ('Aprobado', 'Documento Aprobado')], default='Proceso', max_length=30)),
                ('id_adoptante', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.adoptante')),
            ],
            options={
                'db_table': 'documentos',
            },
        ),
        migrations.CreateModel(
            name='Pet',
            fields=[
                ('id_pets', models.AutoField(primary_key=True, serialize=False)),
                ('edad', models.IntegerField(blank=True, null=True)),
                ('nombre', models.CharField(max_length=50)),
                ('sexo', models.CharField(blank=True, max_length=10)),
                ('descripcion', models.TextField(blank=True)),
                ('comentario', models.TextField(blank=True)),
                ('fecha_llegada', models.DateField()),
                ('disponibilidad', models.BooleanField(default=True)),
                ('img', models.ImageField(upload_to='animales')),
                ('id_especie', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.especie')),
            ],
            options={
                'db_table': 'pets',
            },
        ),
        migrations.AddField(
            model_name='adoptante',
            name='id_pets',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.pet'),
        ),
        migrations.CreateModel(
            name='Raza',
            fields=[
                ('id_raza', models.AutoField(primary_key=True, serialize=False)),
                ('raza', models.CharField(max_length=100)),
                ('id_especie', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.especie')),
            ],
        ),
        migrations.AddField(
            model_name='pet',
            name='id_raza',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.raza'),
        ),
        migrations.CreateModel(
            name='Refugio',
            fields=[
                ('id_refugio', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
                ('direccion', models.CharField(blank=True, max_length=255)),
                ('telefono', models.CharField(blank=True, max_length=15)),
                ('id_ciudad', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.ciudad')),
            ],
            options={
                'db_table': 'refugio',
            },
        ),
        migrations.AddField(
            model_name='pet',
            name='id_refugio',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.refugio'),
        ),
        migrations.CreateModel(
            name='Admin',
            fields=[
                ('id_admin', models.AutoField(primary_key=True, serialize=False)),
                ('rut', models.CharField(max_length=12, unique=True)),
                ('nombre', models.CharField(max_length=50)),
                ('apellidos', models.CharField(max_length=50)),
                ('email', models.EmailField(max_length=100)),
                ('password', models.CharField(max_length=255)),
                ('telefono', models.CharField(blank=True, max_length=15)),
                ('rol', models.CharField(choices=[('admin', 'Administrador')], default='usuario', max_length=7)),
                ('id_refugio', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.refugio')),
            ],
            options={
                'db_table': 'admin',
            },
        ),
        migrations.CreateModel(
            name='Reunion',
            fields=[
                ('id_reunion', models.AutoField(primary_key=True, serialize=False)),
                ('message', models.TextField(blank=True)),
                ('link_reunion', models.CharField(blank=True, max_length=255)),
                ('email_cliente', models.EmailField(blank=True, max_length=100)),
                ('fecha_reunion', models.DateField()),
                ('hora_reunion', models.TimeField()),
                ('id_adoptante', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.adoptante')),
            ],
            options={
                'db_table': 'reuniones',
            },
        ),
        migrations.CreateModel(
            name='FechaVisita',
            fields=[
                ('id_visita', models.AutoField(primary_key=True, serialize=False)),
                ('fecha_visita', models.DateField()),
                ('hora_visita', models.TimeField()),
                ('id_pets', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.pet')),
                ('id_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.user')),
            ],
            options={
                'db_table': 'fecha_visitas',
            },
        ),
        migrations.CreateModel(
            name='Donacion',
            fields=[
                ('id_donacion', models.AutoField(primary_key=True, serialize=False)),
                ('tipo_donacion', models.CharField(max_length=50)),
                ('message', models.TextField(blank=True)),
                ('fecha_donacion', models.DateField()),
                ('id_detalleDonacion', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.detalledonacion')),
                ('id_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.user')),
            ],
            options={
                'db_table': 'donaciones',
            },
        ),
        migrations.AddField(
            model_name='adoptante',
            name='id_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.user'),
        ),
    ]
