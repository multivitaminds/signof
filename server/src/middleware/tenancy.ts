// Multi-tenancy middleware: extract tenant from JWT/header, set RLS context

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export interface TenantRequest extends Request {
  tenantId?: string;
  userId?: string;
}

/**
 * Extract tenant ID from:
 * 1. X-Tenant-ID header (for API keys / service-to-service)
 * 2. JWT payload (tenant claim)
 * 3. Default tenant fallback (dev mode)
 */
export function extractTenant(req: Request, _res: Response, next: NextFunction): void {
  const tenantReq = req as TenantRequest;

  // 1. Explicit header (service-to-service, admin tools)
  const headerTenant = req.headers['x-tenant-id'];
  if (typeof headerTenant === 'string' && headerTenant.length > 0) {
    tenantReq.tenantId = headerTenant;
    next();
    return;
  }

  // 2. From JWT payload (set by auth middleware)
  const jwtTenant = (req as unknown as { tenantId?: string }).tenantId;
  if (jwtTenant) {
    tenantReq.tenantId = jwtTenant;
    next();
    return;
  }

  // 3. Default tenant for dev mode
  tenantReq.tenantId = 'default';
  logger.debug('Using default tenant', { path: req.path });
  next();
}

/**
 * Require a valid tenant ID on the request.
 * Use after extractTenant middleware.
 */
export function requireTenant(req: Request, res: Response, next: NextFunction): void {
  const tenantReq = req as TenantRequest;
  if (!tenantReq.tenantId) {
    res.status(400).json({ error: 'Tenant context required' });
    return;
  }
  next();
}
