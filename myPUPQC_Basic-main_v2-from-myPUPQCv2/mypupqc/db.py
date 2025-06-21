from django.db import connection, transaction
from django.apps import apps

table_names = [model._meta.db_table for model in apps.get_models()]
print("Tables detected:", table_names)

@transaction.atomic
def reset_auto_increment_mysql():
    try:
        with connection.cursor() as cursor:
            for table_name in table_names:
                query = f"SELECT MAX(id) FROM `{table_name}`"
                print(query)
                cursor.execute(query)
                max_id = cursor.fetchone()[0] or 0
                
                query = f"ALTER TABLE `{table_name}` AUTO_INCREMENT = {max_id + 1}"
                print(query)
                cursor.execute(query)
                
        print("MySQL auto-increment reset successfully.")
    except Exception as e:
        print(f"MySQL Error: {e}")

@transaction.atomic
def reset_auto_increment_postgres():
    try:
        with connection.cursor() as cursor:
            for model in apps.get_models():
                table_name = model._meta.db_table
                primary_key = model._meta.pk.column

                # Get sequence name and ensure it includes the correct schema
                query = f"SELECT schemaname, sequencename FROM pg_sequences WHERE sequencename = '{table_name}_{primary_key}_seq'"
                print(query)
                cursor.execute(query)
                sequence_result = cursor.fetchone()

                if sequence_result:
                    schema_name, sequence_name = sequence_result  # Extract schema and sequence name
                    full_sequence_name = f'"{schema_name}"."{sequence_name}"'  # Ensure schema is used correctly

                    # Get new increment value
                    query = f'SELECT COALESCE(MAX("{primary_key}"), 0) + 1 FROM "{table_name}"'
                    print(query)
                    cursor.execute(query)
                    new_id = cursor.fetchone()[0]

                    # Reset sequence
                    query = f'ALTER SEQUENCE {full_sequence_name} RESTART WITH {new_id}'
                    print(query)
                    cursor.execute(query)
                
                print("====================================")

        print("PostgreSQL auto-increment reset successfully.")
    except Exception as e:
        print(f"PostgreSQL Error: {e}")

def reset_auto_increment():
    provider = connection.vendor
    print(f"Database provider detected: {provider}")
    if provider == 'mysql':
        reset_auto_increment_mysql()
    elif provider == 'postgresql':
        reset_auto_increment_postgres()
    else:
        print("Unsupported database")

# Call the function to reset auto-increment
reset_auto_increment()
