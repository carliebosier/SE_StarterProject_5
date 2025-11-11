from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Games
from .serializer import GamesSerializer
from random import randrange
from .randomGen import *
from .readJSONFile import *
from .boggle_solver import *
from django.contrib.staticfiles import finders
from datetime import datetime
import json

# define the endpoints

@api_view(['GET', 'DELETE']) # define a GET Object with pk
def get_game(request, pk):
    try:
        game = Games.objects.get(pk=pk)
    except Games.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = GamesSerializer(game)
        return Response(serializer.data)
    elif request.method == 'DELETE':
        game.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
 
@api_view(['GET']) # define a GET REQUEST to get ALL Games
def get_games(request):
    games = Games.objects.all()
    serializer = GamesSerializer(games, many=True)
    return Response(serializer.data)

@api_view(['GET']) # define a GET REQUEST TO CREATE A GAME OF SIZE size (does not save to database)
def create_game(request, size):
    if((size <= 10) and (size >= 3)):
        g = random_grid(size)
        now = datetime.now()
        name = f'Rand{size}Grid:{now.strftime("%Y-%m-%d %H:%M:%S")}'

        # Find the absolute path of the static JSON file
        file_path = finders.find("data/full-wordlist.json")

        dictionary = read_json_to_list(file_path)    
        mygame = Boggle(g, dictionary)
        fwords = mygame.getSolution()

        # Use JSON format to match frontend format (replace double quotes with single quotes for consistency)
        grid_json = json.dumps(g).replace('"', "'")
        foundwords_json = json.dumps(fwords).replace('"', "'")
        
        # Return game data without saving to database
        game_data = {
            "name": name,
            "size": size,
            "grid": grid_json,
            "foundwords": foundwords_json
        }
        return Response(game_data, status=status.HTTP_200_OK)
    return Response({"error": "Invalid size"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST']) # define a POST REQUEST TO SAVE A GAME WITH CUSTOM NAME
def save_game(request):
    serializer = GamesSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)