import { query } from '../config/database.js';

export class Analytics {
  constructor(data) {
    Object.assign(this, data);
  }

  // Track an event
  static async trackEvent(eventData) {
    const {
      userId,
      eventType,
      resourceType,
      resourceId,
      metadata = {},
      ipAddress,
      userAgent,
      sessionId
    } = eventData;

    const result = await query(`
      INSERT INTO analytics (
        user_id, event_type, resource_type, resource_id, metadata,
        ip_address, user_agent, session_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      userId, eventType, resourceType, resourceId, JSON.stringify(metadata),
      ipAddress, userAgent, sessionId
    ]);

    return new Analytics(result.rows[0]);
  }

  // Get dashboard statistics
  static async getDashboardStats(dateFrom = null, dateTo = null) {
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (dateFrom) {
      whereConditions.push(`created_at >= $${paramCount}`);
      queryParams.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      whereConditions.push(`created_at <= $${paramCount}`);
      queryParams.push(dateTo);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get basic stats
    const basicStatsResult = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
        COUNT(*) FILTER (WHERE event_type = 'search') as searches,
        COUNT(*) FILTER (WHERE event_type = 'booking_attempt') as booking_attempts,
        COUNT(*) FILTER (WHERE event_type = 'booking_completed') as bookings_completed
      FROM analytics
      ${whereClause}
    `, queryParams);

    // Get popular pages
    const popularPagesResult = await query(`
      SELECT 
        resource_type,
        resource_id,
        COUNT(*) as views,
        COUNT(DISTINCT user_id) as unique_viewers
      FROM analytics
      WHERE event_type = 'page_view' AND resource_type IN ('trip', 'hotel')
      ${whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : ''}
      GROUP BY resource_type, resource_id
      ORDER BY views DESC
      LIMIT 10
    `, queryParams);

    // Get search terms
    const searchTermsResult = await query(`
      SELECT 
        metadata->>'search_term' as search_term,
        COUNT(*) as search_count
      FROM analytics
      WHERE event_type = 'search' AND metadata->>'search_term' IS NOT NULL
      ${whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : ''}
      GROUP BY metadata->>'search_term'
      ORDER BY search_count DESC
      LIMIT 10
    `, queryParams);

    return {
      basicStats: basicStatsResult.rows[0],
      popularPages: popularPagesResult.rows,
      searchTerms: searchTermsResult.rows
    };
  }

  // Get user behavior analytics
  static async getUserBehaviorStats(dateFrom = null, dateTo = null) {
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (dateFrom) {
      whereConditions.push(`created_at >= $${paramCount}`);
      queryParams.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      whereConditions.push(`created_at <= $${paramCount}`);
      queryParams.push(dateTo);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get hourly activity
    const hourlyActivityResult = await query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as events,
        COUNT(DISTINCT user_id) as unique_users
      FROM analytics
      ${whereClause}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `, queryParams);

    // Get daily activity
    const dailyActivityResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as events,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM analytics
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, queryParams);

    // Get user journey (most common event sequences)
    const userJourneyResult = await query(`
      SELECT 
        event_type,
        LAG(event_type) OVER (PARTITION BY session_id ORDER BY created_at) as previous_event,
        COUNT(*) as frequency
      FROM analytics
      ${whereClause}
      GROUP BY event_type, LAG(event_type) OVER (PARTITION BY session_id ORDER BY created_at)
      HAVING LAG(event_type) OVER (PARTITION BY session_id ORDER BY created_at) IS NOT NULL
      ORDER BY frequency DESC
      LIMIT 20
    `, queryParams);

    return {
      hourlyActivity: hourlyActivityResult.rows,
      dailyActivity: dailyActivityResult.rows,
      userJourney: userJourneyResult.rows
    };
  }

  // Get conversion analytics
  static async getConversionStats(dateFrom = null, dateTo = null) {
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (dateFrom) {
      whereConditions.push(`created_at >= $${paramCount}`);
      queryParams.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      whereConditions.push(`created_at <= $${paramCount}`);
      queryParams.push(dateTo);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get conversion funnel
    const conversionFunnelResult = await query(`
      WITH funnel_data AS (
        SELECT 
          session_id,
          MAX(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) as viewed,
          MAX(CASE WHEN event_type = 'search' THEN 1 ELSE 0 END) as searched,
          MAX(CASE WHEN event_type = 'booking_attempt' THEN 1 ELSE 0 END) as attempted_booking,
          MAX(CASE WHEN event_type = 'booking_completed' THEN 1 ELSE 0 END) as completed_booking
        FROM analytics
        ${whereClause}
        GROUP BY session_id
      )
      SELECT 
        SUM(viewed) as total_visitors,
        SUM(searched) as searched_visitors,
        SUM(attempted_booking) as booking_attempts,
        SUM(completed_booking) as completed_bookings,
        ROUND(SUM(searched)::numeric / NULLIF(SUM(viewed), 0) * 100, 2) as search_conversion_rate,
        ROUND(SUM(attempted_booking)::numeric / NULLIF(SUM(searched), 0) * 100, 2) as attempt_conversion_rate,
        ROUND(SUM(completed_booking)::numeric / NULLIF(SUM(attempted_booking), 0) * 100, 2) as completion_conversion_rate
      FROM funnel_data
    `, queryParams);

    // Get conversion by source
    const conversionBySourceResult = await query(`
      SELECT 
        metadata->>'source' as source,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(*) FILTER (WHERE event_type = 'booking_completed') as conversions,
        ROUND(
          COUNT(*) FILTER (WHERE event_type = 'booking_completed')::numeric / 
          NULLIF(COUNT(DISTINCT session_id), 0) * 100, 2
        ) as conversion_rate
      FROM analytics
      ${whereClause}
      GROUP BY metadata->>'source'
      HAVING metadata->>'source' IS NOT NULL
      ORDER BY conversions DESC
      LIMIT 10
    `, queryParams);

    return {
      conversionFunnel: conversionFunnelResult.rows[0],
      conversionBySource: conversionBySourceResult.rows
    };
  }

  // Get content performance analytics
  static async getContentPerformance(contentType = null, dateFrom = null, dateTo = null) {
    let whereConditions = ['event_type = $1'];
    let queryParams = ['page_view'];
    let paramCount = 2;

    if (contentType) {
      whereConditions.push(`resource_type = $${paramCount}`);
      queryParams.push(contentType);
      paramCount++;
    }

    if (dateFrom) {
      whereConditions.push(`created_at >= $${paramCount}`);
      queryParams.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      whereConditions.push(`created_at <= $${paramCount}`);
      queryParams.push(dateTo);
      paramCount++;
    }

    const result = await query(`
      SELECT 
        a.resource_type,
        a.resource_id,
        COALESCE(t.title, h.name) as content_title,
        COALESCE(t.slug, h.slug) as content_slug,
        c.name as category_name,
        COUNT(*) as total_views,
        COUNT(DISTINCT a.user_id) as unique_viewers,
        COUNT(DISTINCT a.session_id) as unique_sessions,
        AVG(EXTRACT(EPOCH FROM (
          LEAD(a.created_at) OVER (PARTITION BY a.session_id ORDER BY a.created_at) - a.created_at
        ))) as avg_time_on_page
      FROM analytics a
      LEFT JOIN trips t ON a.resource_type = 'trip' AND a.resource_id = t.id
      LEFT JOIN hotels h ON a.resource_type = 'hotel' AND a.resource_id = h.id
      LEFT JOIN categories c ON (t.category_id = c.id OR h.category_id = c.id)
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY a.resource_type, a.resource_id, t.title, h.name, t.slug, h.slug, c.name
      ORDER BY total_views DESC
      LIMIT 20
    `, queryParams);

    return result.rows;
  }

  // Get real-time analytics
  static async getRealTimeStats() {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '5 minutes') as events_last_5_min,
        COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '5 minutes') as active_users_5_min,
        COUNT(DISTINCT session_id) FILTER (WHERE created_at >= NOW() - INTERVAL '5 minutes') as active_sessions_5_min,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as events_last_hour,
        COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as active_users_hour,
        COUNT(*) FILTER (WHERE event_type = 'page_view' AND created_at >= NOW() - INTERVAL '1 hour') as page_views_hour,
        COUNT(*) FILTER (WHERE event_type = 'booking_completed' AND created_at >= NOW() - INTERVAL '1 hour') as bookings_hour
      FROM analytics
    `);

    return result.rows[0];
  }

  // Clean old analytics data
  static async cleanOldData(daysToKeep = 365) {
    const result = await query(`
      DELETE FROM analytics
      WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
      RETURNING COUNT(*) as deleted_count
    `);

    return parseInt(result.rows[0]?.deleted_count) || 0;
  }

  // Get analytics summary
  static async getSummary(dateFrom = null, dateTo = null) {
    const [dashboardStats, userBehavior, conversionStats, contentPerformance] = await Promise.all([
      this.getDashboardStats(dateFrom, dateTo),
      this.getUserBehaviorStats(dateFrom, dateTo),
      this.getConversionStats(dateFrom, dateTo),
      this.getContentPerformance(null, dateFrom, dateTo)
    ]);

    return {
      dashboard: dashboardStats,
      userBehavior,
      conversion: conversionStats,
      contentPerformance: contentPerformance.slice(0, 10) // Top 10 content
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      ...this,
      metadata: typeof this.metadata === 'string' ? JSON.parse(this.metadata) : this.metadata
    };
  }
}
