# Generated by Django 5.1 on 2024-10-27 06:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_remove_donacion_id_detalledonacion_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fechavisita',
            name='hora_visita',
            field=models.TimeField(blank=True, null=True),
        ),
    ]
