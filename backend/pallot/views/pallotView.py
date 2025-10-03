from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pallot.models.pallot import Pallot
from pallot.models.pallotLocation import Chamber, Floor, Pocket
from sr.models.sr import SR
from pallot.serializers.pallotSerializers import PallotSerializer
from pallot.permissions import PallotModulePermission
from utils.excel_import import import_excel_to_model
from django.views.decorators.cache import cache_page

class PallotViewSet(viewsets.ModelViewSet):
    queryset = Pallot.objects.all().select_related("sr", "chamber", "floor", "pocket", "pallot_type")
    serializer_class = PallotSerializer
    permission_classes = [PallotModulePermission]
    module_name = "pallot"
    
    @action(detail=False, methods=["get"])
    def get_sr_quantity(self, request):
        sr_no = request.query_params.get("sr_no")
        if not sr_no:
            return Response({"error": "sr_no required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sr = SR.objects.get(sr_no=sr_no)
            return Response(
                {"sr_quantity": sr.submitted_bag_quantity, "sr_id": sr.id, "sr_no": sr.sr_no},
                status=status.HTTP_200_OK
            )
        except SR.DoesNotExist:
            return Response({"error": "SR not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["get"])
    def floors_by_chamber(self, request):
        chamber_id = request.query_params.get("chamber_id")
        if not chamber_id:
            return Response({"error": "chamber_id required"}, status=status.HTTP_400_BAD_REQUEST)
        floors = Floor.objects.filter(chamber_id=chamber_id).values("id", "name")
        return Response(list(floors), status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def pockets_by_floor(self, request):
        floor_id = request.query_params.get("floor_id")
        if not floor_id:
            return Response({"error": "floor_id required"}, status=status.HTTP_400_BAD_REQUEST)
        pockets = Pocket.objects.filter(floor_id=floor_id).values("id", "name")
        return Response(list(pockets), status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["post"], url_path="bulk_create")
    def bulk_create(self, request, *args, **kwargs):
        
        data = request.data
        many = isinstance(data, list)  # list এলে many=True
        serializer = self.get_serializer(data=data, many=many)
        serializer.is_valid(raise_exception=True)
        instances = serializer.save()
        read_serializer = PallotSerializer(instances, many=many, context={"request": request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        # Excel column → Model field mapping for Pallot
        field_mapping = {
            "pallot_type": "pallot_type_id",
            "date": "date",
            "pallot_number": "pallot_number",
            # "sr": "sr_no",
            "sr_quantity": "sr_quantity",
            "comment": "comment",
            "chamber": "chamber_id",
            "floor": "floor_id",
            "pocket": "pocket_id",
            "quantity": "quantity",
        }

        result = import_excel_to_model(file, Pallot, field_mapping)

        if result["status"] == "success":
            return Response({"success": f"{result['count']} Pallot imported"}, status=201)
        else:
            return Response({"error": result["message"]}, status=400)
