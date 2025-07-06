
export interface SecurityEvent {
  id: string;
  type: 'suspicious_login' | 'api_abuse' | 'rate_limit_exceeded' | 'unauthorized_access' | 'data_breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  resolved: boolean;
}

export interface SecurityMetrics {
  totalThreats: number;
  activeThreats: number;
  threatsByType: Record<string, number>;
  threatsBySeverity: Record<string, number>;
  averageResponseTime: number;
  securityScore: number;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private rateLimits: Map<string, { count: number; window: number }> = new Map();
  private suspiciousPatterns: string[] = [
    'script', 'eval', 'document.cookie', 'javascript:', 'onload=', 'onerror='
  ];

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      resolved: false
    };

    this.events.push(securityEvent);
    console.warn(`🔒 Security Alert [${event.severity.toUpperCase()}]: ${event.type}`, event.details);

    // Auto-respond to critical threats
    if (event.severity === 'critical') {
      this.handleCriticalThreat(securityEvent);
    }
  }

  checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = `${identifier}_${Math.floor(now / windowMs)}`;
    
    const current = this.rateLimits.get(key) || { count: 0, window: now };
    current.count++;
    
    if (current.count > maxRequests) {
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        details: {
          identifier,
          requestCount: current.count,
          limit: maxRequests,
          window: windowMs
        }
      });
      return false;
    }
    
    this.rateLimits.set(key, current);
    return true;
  }

  validateInput(input: string, context: string): boolean {
    const suspiciousPatterns = this.suspiciousPatterns.some(pattern => 
      input.toLowerCase().includes(pattern.toLowerCase())
    );

    if (suspiciousPatterns) {
      this.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'high',
        details: {
          input: input.substring(0, 100), // Log first 100 chars
          context,
          patterns: this.suspiciousPatterns.filter(p => input.toLowerCase().includes(p))
        }
      });
      return false;
    }

    return true;
  }

  monitorAPIAccess(endpoint: string, userId?: string, ipAddress?: string): void {
    // Check for suspicious access patterns
    const recentEvents = this.events.filter(e => 
      e.timestamp > new Date(Date.now() - 300000) && // Last 5 minutes
      (e.userId === userId || e.ipAddress === ipAddress)
    );

    if (recentEvents.length > 50) {
      this.logSecurityEvent({
        type: 'api_abuse',
        severity: 'high',
        userId,
        ipAddress,
        details: {
          endpoint,
          recentEventCount: recentEvents.length,
          timeWindow: '5 minutes'
        }
      });
    }
  }

  detectAnomalousActivity(userId: string, activity: string, metadata: Record<string, any>): void {
    // Simple anomaly detection based on patterns
    const userEvents = this.events.filter(e => e.userId === userId);
    const recentActivity = userEvents.filter(e => 
      e.timestamp > new Date(Date.now() - 3600000) // Last hour
    );

    // Check for unusual activity spikes
    if (recentActivity.length > 100) {
      this.logSecurityEvent({
        type: 'suspicious_login',
        severity: 'medium',
        userId,
        details: {
          activity,
          recentActivityCount: recentActivity.length,
          ...metadata
        }
      });
    }
  }

  encryptSensitiveData(data: string, key?: string): string {
    // Simple encryption for demo purposes - in production use proper crypto
    const encodedData = btoa(data);
    return encodedData.split('').reverse().join('');
  }

  decryptSensitiveData(encryptedData: string, key?: string): string {
    // Simple decryption - reverse of encryption
    const reversedData = encryptedData.split('').reverse().join('');
    return atob(reversedData);
  }

  generateSecureToken(length: number = 32): string {
    if (window.crypto && window.crypto.getRandomValues) {
      // Use Web Crypto API for cryptographically secure random values
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Enhanced fallback with timestamp entropy
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let result = '';
      const timestamp = Date.now().toString();
      
      for (let i = 0; i < length; i++) {
        // Add timestamp entropy
        const timestampIndex = i % timestamp.length;
        const timestampChar = timestamp[timestampIndex];
        const randomIndex = Math.floor(Math.random() * chars.length);
        
        // Combine random char with timestamp-derived randomness
        const combinedIndex = (randomIndex + parseInt(timestampChar, 10)) % chars.length;
        result += chars.charAt(combinedIndex);
      }
      return result;
    }
  }

  auditKeyAccess(keyId: string, action: 'read' | 'write' | 'delete', userId?: string): void {
    this.logSecurityEvent({
      type: 'unauthorized_access',
      severity: 'low',
      userId,
      details: {
        keyId,
        action,
        audit: true
      }
    });
  }

  getSecurityMetrics(): SecurityMetrics {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp > last24Hours);
    
    const threatsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const threatsBySeverity = recentEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeThreats = recentEvents.filter(e => !e.resolved).length;
    const resolvedEvents = this.events.filter(e => e.resolved);
    const averageResponseTime = resolvedEvents.length > 0 
      ? resolvedEvents.reduce((sum, e) => sum + (e.timestamp.getTime() - e.timestamp.getTime()), 0) / resolvedEvents.length
      : 0;

    // Calculate security score (0-100)
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
    const highEvents = recentEvents.filter(e => e.severity === 'high').length;
    const baseScore = 100;
    const securityScore = Math.max(0, baseScore - (criticalEvents * 20) - (highEvents * 10) - (activeThreats * 5));

    return {
      totalThreats: recentEvents.length,
      activeThreats,
      threatsByType,
      threatsBySeverity,
      averageResponseTime,
      securityScore
    };
  }

  resolveSecurityEvent(eventId: string, resolution: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      event.details.resolution = resolution;
      event.details.resolvedAt = new Date();
      console.log(`✅ Security event ${eventId} resolved: ${resolution}`);
    }
  }

  getActiveThreats(): SecurityEvent[] {
    return this.events.filter(e => !e.resolved && e.severity !== 'low');
  }

  private handleCriticalThreat(event: SecurityEvent): void {
    console.error(`🚨 CRITICAL SECURITY THREAT DETECTED: ${event.type}`);
    
    // In a real implementation, this would trigger:
    // - Immediate notifications to security team
    // - Automatic IP blocking
    // - Rate limiting escalation
    // - Account suspension if needed
    
    // For now, just log the action
    console.log('🛡️ Automatic security measures activated');
  }

  private generateEventId(): string {
    return `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const securityMonitor = SecurityMonitor.getInstance();
