"""FFZone – Tournaments URL Routes"""

from django.urls import path
from . import views

urlpatterns = [
    # List / browse (must be first)
    path("",                             views.list_tournaments,       name="list_tournaments"),

    # Specific named paths BEFORE <str:tournament_id>/ catch-all
    path("my-registrations/",           views.my_registrations,       name="my_registrations"),
    path("create/",                      views.create_tournament,      name="create_tournament"),
    path("admin/stats/",                 views.admin_dashboard_stats,  name="admin_stats"),
    path("public-stats/",                views.public_stats,           name="public_stats"),

    # Team Finder
    path("team-finder/",                 views.list_team_finder,       name="list_team_finder"),
    path("team-finder/create/",          views.create_team_finder,     name="create_team_finder"),
    path("team-finder/<str:post_id>/fill/", views.mark_team_filled,   name="mark_team_filled"),

    # Tournament-specific (catch-all MUST be last)
    path("<str:tournament_id>/results/submit/", views.submit_results, name="submit_results"),
    path("<str:tournament_id>/results/",  views.tournament_results,    name="tournament_results"),
    path("<str:tournament_id>/update/",   views.update_tournament,     name="update_tournament"),
    path("<str:tournament_id>/delete/",   views.delete_tournament,     name="delete_tournament"),
    path("<str:tournament_id>/room/",     views.set_room_info,         name="set_room_info"),
    path("<str:tournament_id>/",          views.tournament_detail,     name="tournament_detail"),
]
