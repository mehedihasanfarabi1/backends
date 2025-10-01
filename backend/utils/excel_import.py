# utils/excel_import.py
import pandas as pd
from django.db import transaction

from company.models import Company, BusinessType, Factory
from products.models import ProductType, Category, Unit, UnitSize,Product
from party_type.models.party_type import PartyType
from party_type.models.party import Party
from booking.models.booking import Booking
from pallot.models.pallotType import PallotType
from pallot.models.pallotLocation import Chamber,Floor,Pocket
# 🔹 কোন model কোন field দিয়ে lookup হবে
FK_LOOKUP = {
    "company_id": (Company, "name"),
    "business_type_id": (BusinessType, "name"),
    "factory_id": (Factory, "name"),
    "product_type_id": (ProductType, "name"),
    "category_id": (Category, "name"),       
    "product_id": (Product, "name"),      
    "unit_id": (Unit, "name"),
    "unit_size_id": (UnitSize, "size_name"), 
    "size_id": (UnitSize, "size_name"),
    "parent_unit_id": (Unit, "name"),
    "child_unit_id": (Unit, "name"),
    "party_type_id": (PartyType, "name"),
    "party_id": (Party, "name"),
    "booking_id":(Booking,"name"),
    "pallot_type_id":(PallotType,"name"),
    "chamber_id":(Chamber,"name"),
    "floor_id":(Floor,"name"),
    "pocket_id":(Pocket,"name"),
}


def import_excel_to_model(file, model_class, field_mapping):
    try:
        df = pd.read_excel(file)
        df = df.fillna("")  
        file_columns = df.columns.tolist()

        missing_cols = [col for col in field_mapping.keys() if col not in file_columns]
        if missing_cols:
            return {"status": "error", "message": f"Missing columns: {', '.join(missing_cols)}"}

        objects = []
        errors = []

        for i, row in df.iterrows():
            data = {}

            # Excel → Model field mapping
            for excel_col, model_field in field_mapping.items():
                value = row.get(excel_col, None)
                data[model_field] = value.strip() if isinstance(value, str) else value

            # ForeignKey resolve
            for fk_field, (model, lookup_field) in FK_LOOKUP.items():
                if fk_field in data and data[fk_field]:
                    obj = model.objects.filter(**{lookup_field: data[fk_field]}).first()
                    if not obj:
                        errors.append(
                            f"Row {i+2}: {model.__name__} '{data[fk_field]}' not found"
                        )
                        data[fk_field] = None
                    else:
                        data[fk_field] = obj.id

            objects.append(model_class(**data))

        if errors:
            return {"status": "error", "message": "\n".join(errors)}

        with transaction.atomic():
            model_class.objects.bulk_create(objects)

        return {"status": "success", "count": len(objects)}

    except Exception as e:
        return {"status": "error", "message": str(e)}



# def import_excel_to_model(file, model_class, field_mapping, fk_lookup=None):
#     if fk_lookup is None:
#         fk_lookup = {}

#     try:
#         import pandas as pd
#         from django.db import transaction

#         df = pd.read_excel(file)
#         df = df.fillna("")
#         file_columns = df.columns.tolist()

#         missing_cols = [col for col in field_mapping.keys() if col not in file_columns]
#         if missing_cols:
#             return {"status": "error", "message": f"Missing columns: {', '.join(missing_cols)}"}

#         objects = []
#         errors = []

#         for i, row in df.iterrows():
#             data = {}
#             for excel_col, model_field in field_mapping.items():
#                 value = row.get(excel_col, None)
#                 data[model_field] = value.strip() if isinstance(value, str) else value

#             # 🔹 Resolve ForeignKeys
#             for fk_field, (model, lookup_field) in fk_lookup.items():
#                 if fk_field in data and data[fk_field]:
#                     obj = model.objects.filter(**{lookup_field: data[fk_field]}).first()
#                     if not obj:
#                         errors.append(f"Row {i+2}: {model.__name__} '{data[fk_field]}' not found")
#                         data[fk_field] = None
#                     else:
#                         data[fk_field] = obj.id

#             objects.append(model_class(**data))

#         if errors:
#             return {"status": "error", "message": "\n".join(errors)}

#         with transaction.atomic():
#             model_class.objects.bulk_create(objects)

#         return {"status": "success", "count": len(objects)}

#     except Exception as e:
#         return {"status": "error", "message": str(e)}
