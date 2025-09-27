from rest_framework import viewsets, status
from rest_framework.response import Response
from pallot.models.pallotLocation import Chamber, Floor, Pocket
from pallot.serializers.pallotLocationSerializers import (
    ChamberSerializer, FloorSerializer, PocketSerializer
)
from pallot.permissions import PallotModulePermission


class ChamberViewSet(viewsets.ModelViewSet):
    queryset = Chamber.objects.all()
    serializer_class = ChamberSerializer
    permission_classes = [PallotModulePermission]
    module_name = "chamber"

    def create(self, request, *args, **kwargs):
        company_id = request.data.get("company_id")  # get company_id
        if not company_id:
            return Response({"error": "company_id is required"}, status=400)

        names = request.data.get("names", [])
        created = []
        for name in names:
            chamber, _ = Chamber.objects.get_or_create(
                name=name, company_id=company_id
            )
            created.append(chamber)

        serializer = self.get_serializer(created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class FloorViewSet(viewsets.ModelViewSet):
    serializer_class = FloorSerializer
    permission_classes = [PallotModulePermission]
    module_name = "floor"

    def get_queryset(self):
        chamber_id = self.request.query_params.get("chamber_id")
        qs = Floor.objects.all()
        if chamber_id:
            qs = qs.filter(chamber_id=chamber_id)
        return qs

    def create(self, request, *args, **kwargs):
        chamber_id = request.data.get("chamber_id")
        if not chamber_id:
            return Response({"error": "chamber_id is required"}, status=400)
        floors = request.data.get("floors", [])
        created = []
        for f in floors:
            floor, _ = Floor.objects.get_or_create(chamber_id=chamber_id, name=f["name"])
            created.append(floor)
        serializer = self.get_serializer(created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PocketViewSet(viewsets.ModelViewSet):
    serializer_class = PocketSerializer
    permission_classes = [PallotModulePermission]
    module_name = "pocket"

    def get_queryset(self):
        chamber_id = self.request.query_params.get("chamber_id")
        floor_id = self.request.query_params.get("floor_id")
        qs = Pocket.objects.all()
        if chamber_id:
            qs = qs.filter(chamber_id=chamber_id)
        if floor_id:
            qs = qs.filter(floor_id=floor_id)
        return qs

    def create(self, request, *args, **kwargs):
        chamber_id = request.data.get("chamber_id")
        floor_id = request.data.get("floor_id")
        pockets = request.data.get("pockets", [])
        created = []
        for p in pockets:
            pocket, _ = Pocket.objects.get_or_create(
                chamber_id=chamber_id,
                floor_id=floor_id,
                name=p["name"],
                defaults={"capacity": p.get("capacity", 0)}
            )
            created.append(pocket)
        serializer = self.get_serializer(created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # --- Add this update method ---
    def update(self, request, *args, **kwargs):
        pocket = self.get_object()
        chamber_id = request.data.get("chamber_id")
        floor_id = request.data.get("floor_id")
        name = request.data.get("name")
        capacity = request.data.get("capacity", 0)

        if not chamber_id or not floor_id or not name:
            return Response({"error": "chamber_id, floor_id, and name are required"}, status=400)

        pocket.chamber_id = chamber_id
        pocket.floor_id = floor_id
        pocket.name = name
        pocket.capacity = capacity
        pocket.save()

        serializer = self.get_serializer(pocket)
        return Response(serializer.data, status=200)
