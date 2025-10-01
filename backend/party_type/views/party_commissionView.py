
from rest_framework import viewsets
from party_type.models.patry_commission import PartyCommission
from party_type.serializers.patry_commissionSerializers import PartyCommissionSerializer,PartyCommissionCreateSerializer
from party_type.permissions import PartyTypeModulePermission
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from utils.excel_import import import_excel_to_model



class PartyCommissionViewSet(viewsets.ModelViewSet):
    queryset = PartyCommission.objects.all().select_related(
        "party_type", "party", "category", "product", "unit", "unit_size"
    )
    serializer_class = PartyCommissionSerializer
    permission_classes = [PartyTypeModulePermission]
    module_name = "party_commission"

    def get_serializer_class(self):
        if self.action in ["create", "bulk_create", "update", "partial_update"]:
            return PartyCommissionCreateSerializer
        return PartyCommissionSerializer


    # ✅ single create override
    def create(self, request, *args, **kwargs):
        """একটা commission create করার জন্য"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    # ✅ update override (optional, পরিষ্কারভাবে nested ফেরত দিতে)
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        read_serializer = PartyCommissionSerializer(instance, context={"request": request})
        return Response(read_serializer.data, status=status.HTTP_200_OK)
    # ✅ bulk create
    @action(detail=False, methods=["post"], url_path="bulk-create")
    def bulk_create(self, request, *args, **kwargs):
        """একসাথে multiple create handle করবে"""
        data = request.data

        if not isinstance(data, list):
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            # 👉 nested data সহ response দিতে হবে
            read_serializer = PartyCommissionSerializer(instance, context={"request": request})
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)

        # multiple হলে many=True
        serializer = self.get_serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        instances = serializer.save()
        # 👉 nested serializer দিয়ে response
        read_serializer = PartyCommissionSerializer(instances, many=True, context={"request": request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
    # ✅ Bulk Import Excel
    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Excel column → model field mapping
        field_mapping = {
            "party_type": "party_type_id",   
            "party": "party_id",          
            "category": "category_id",       
            "product": "product_id",        
            "unit": "unit_id",              
            "unit_size": "unit_size_id",  
            "commission_percentage": "commission_percentage",
            "commission_amount": "commission_amount",
        }

        # Excel থেকে import → FK lookups handled automatically via utils.excel_import.py
        result = import_excel_to_model(file, PartyCommission, field_mapping)

        if result["status"] == "success":
            return Response(
                {"success": f"{result['count']} PartyCommission imported"},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response({"error": result["message"]}, status=status.HTTP_400_BAD_REQUEST)
