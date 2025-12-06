import type { User, Role } from '../interfaces';

export function userHasClaim(
  userClaim: string, 
  userId: string | null,
  usersRegistered: User[], 
  availableRoles: Role[] ) {

  if( userId == null ) return true;

  const user = usersRegistered.find(u=>u.userId==userId);
  const roles = user?.roles;
  const userRoles = availableRoles.filter(r=>roles?.includes(r.role));

  if( !roles )  return false;  

  const claims = new Set<string>();
  for (let role of userRoles) {
    for (let claim of role.claims) {
      claims.add(claim);
    }
  }

  return claims.has(userClaim);
}
