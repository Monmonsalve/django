# Generated by Django 5.1 on 2024-10-26 20:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_user_groups_user_is_superuser_user_last_login_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='contacto',
            fields=[
                ('id_contacto', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(blank=True, max_length=50)),
                ('email', models.EmailField(max_length=100, unique=True)),
                ('asunto', models.CharField(blank=True, max_length=50)),
                ('mensaje', models.CharField(blank=True, max_length=500)),
                ('telefono', models.CharField(blank=True, max_length=30)),
                ('estado', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'contacto',
            },
        ),
    ]