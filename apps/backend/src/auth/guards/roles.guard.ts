import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

export class AdminGuard extends RolesGuard {
  constructor() {
    super(['ADMIN']);
  }
}

export class JudgeGuard extends RolesGuard {
  constructor() {
    super(['ADMIN', 'JUDGE']);
  }
}
