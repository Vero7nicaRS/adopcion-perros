from rest_framework.permissions import BasePermission, SAFE_METHODS

# IsAdminOrReadOnly: Permite operaciones de lectura a cualquier usuario, 
# pero las operaciones de escritura requieren un usuario administrador.
class IsAdminOrReadOnly(BasePermission):
    """
    Permite operaciones de lectura a cualquier usuario.
    Las operaciones de escritura requieren un usuario administrador.
    """

    def has_permission(self, request, view):

        # Las operaciones de lectura están permitidas.
        if request.method in SAFE_METHODS:
            return True

        # Las operaciones de escritura requieren ser administrador.
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )