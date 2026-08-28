# 🗄️ Preparedness for War Database

Complete SQL database setup for the Preparedness for War platform.

---

## 📦 What's Included

This folder contains everything you need to set up and manage your Supabase/PostgreSQL database:

| File | Description | Size |
|------|-------------|------|
| **schema.sql** | Main database structure with all tables, indexes, RLS policies | ~500 lines |
| **functions.sql** | Advanced functions for search, analytics, recommendations | ~400 lines |
| **sample-data.sql** | Test data for development (18 posts, 8 media items, etc.) | ~200 lines |
| **migrations.sql** | Database updates and new features | ~300 lines |
| **SETUP_GUIDE.md** | Complete setup instructions with troubleshooting | Full guide |
| **QUICK_REFERENCE.md** | Quick command reference for common tasks | Cheat sheet |

---

## 🚀 Quick Start (3 Steps)

### ⚠️ CRITICAL: Run Files in This Exact Order!

**👉 See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed step-by-step guide**

### 1. Run Schema FIRST
```sql
-- In Supabase SQL Editor, paste and run:
-- Copy entire contents of schema.sql
-- This creates all tables with correct structure
```

### 2. Run Sample Data SECOND
```sql
-- Then paste and run:
-- Copy entire contents of sample-data.sql
-- This adds test data (10 posts, 6 media items, etc.)
```

### 3. (Optional) Run Functions
```sql
-- For advanced features:
-- Copy entire contents of functions.sql
```

### 4. Create Admin
```sql
-- After signing up, run:
UPDATE profiles 
SET is_admin = true, role = 'admin'
WHERE email = 'your-email@example.com';
```

**Done!** Your database is ready. 🎉

---

## ⚠️ Common Errors & Solutions

### Error: "column section does not exist" or "column standfirst does not exist"
**Problem:** You ran `sample-data.sql` BEFORE `schema.sql`  
**Solution:** Run `schema.sql` first, then `sample-data.sql`

**👉 See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for all error solutions**

---

## 📋 Features Included

### Core Features
- ✅ User authentication & profiles
- ✅ Posts with full CRUD
- ✅ Categories & sections
- ✅ Media library (videos, podcasts)
- ✅ Document library (PDFs, resources)
- ✅ Encyclopaedia (A-Z reference)
- ✅ Emergency alerts
- ✅ Notifications system
- ✅ Comments & reactions
- ✅ Bookmarks
- ✅ Newsletter management

### Advanced Features
- ✅ Full-text search
- ✅ Content recommendations
- ✅ Analytics & tracking
- ✅ User activity monitoring
- ✅ Trending content
- ✅ Reading progress
- ✅ Social sharing
- ✅ Post series/collections
- ✅ User badges
- ✅ Content moderation
- ✅ Rate limiting
- ✅ Audit logging

### Security
- ✅ Row Level Security (RLS)
- ✅ Role-based access control
- ✅ API key management
- ✅ Two-factor authentication
- ✅ Content reporting
- ✅ Secure file storage

---

## 📊 Database Structure

### Main Tables (11)
1. **profiles** - User accounts
2. **posts** - Articles/content
3. **media_items** - Videos/podcasts
4. **library_items** - Documents
5. **encyclopaedia_entries** - Reference content
6. **alerts** - Emergency alerts
7. **notifications** - User notifications
8. **sections** - Content sections
9. **categories** - Content categories
10. **countries** - Country data
11. **pages** - Static pages

### Supporting Tables (15+)
- Comments, reactions, bookmarks
- User activity, preferences
- Newsletter, campaigns
- Analytics, page views
- File uploads, storage
- And more...

### Functions (20+)
- Search & recommendations
- Analytics & statistics
- Content management
- User engagement
- Notifications
- Maintenance tasks

---

## 🎯 Use Cases

### For Developers
```sql
-- Get started quickly
\i schema.sql
\i functions.sql
\i sample-data.sql

-- Start building!
```

### For Admins
```sql
-- Manage content
SELECT * FROM posts WHERE status = 'draft';
UPDATE posts SET status = 'published' WHERE id = 'uuid';

-- Monitor activity
SELECT * FROM get_section_stats();
SELECT * FROM get_trending_posts(7, 10);
```

### For Analytics
```sql
-- Get insights
SELECT * FROM get_database_stats();
SELECT * FROM get_trending_topics(30, 20);
SELECT * FROM page_views WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## 📖 Documentation

### Detailed Guides
- **SETUP_GUIDE.md** - Complete setup with troubleshooting
- **QUICK_REFERENCE.md** - Common commands and queries

### SQL Files
- **schema.sql** - Well-commented table definitions
- **functions.sql** - Documented functions with examples
- **migrations.sql** - Update scripts with rollback info

---

## 🔧 Maintenance

### Daily (Automated)
```sql
SELECT cleanup_expired_alerts();
SELECT publish_scheduled_posts();
```

### Weekly
```sql
SELECT * FROM get_database_stats();
VACUUM ANALYZE;
```

### Monthly
```sql
SELECT archive_old_posts(365);
-- Review and optimize
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Can't see data**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

**Issue: Slow queries**
```sql
-- Analyze performance
EXPLAIN ANALYZE SELECT * FROM posts WHERE section = 'emergency';
```

**Issue: Storage full**
```sql
-- Check sizes
SELECT * FROM get_database_stats();
```

See **SETUP_GUIDE.md** for detailed troubleshooting.

---

## 🔐 Security Best Practices

1. **Never commit** `.env` files
2. **Use RLS** for all user-facing tables
3. **Validate input** in application layer
4. **Rotate keys** regularly
5. **Monitor** audit logs
6. **Backup** regularly
7. **Test** RLS policies thoroughly

---

## 📈 Performance Tips

1. **Use indexes** - Already created for common queries
2. **Limit results** - Always use LIMIT in queries
3. **Cache** - Cache frequently accessed data
4. **Optimize images** - Compress before upload
5. **Monitor** - Check slow query log regularly

---

## 🔄 Updates & Migrations

### Applying Updates
```sql
-- Check current version
SELECT * FROM schema_version; -- If you track versions

-- Apply migration
\i migrations.sql

-- Verify
SELECT * FROM table_exists('new_table_name');
```

### Rolling Back
```sql
-- See migrations.sql for rollback scripts
-- Use with caution!
```

---

## 💾 Backup & Restore

### Backup
```bash
# Full database
pg_dump -h your-host -U postgres your-db > backup.sql

# Specific table
pg_dump -h your-host -U postgres -t posts your-db > posts_backup.sql
```

### Restore
```bash
# Full restore
psql -h your-host -U postgres your-db < backup.sql

# Specific table
psql -h your-host -U postgres your-db < posts_backup.sql
```

---

## 🧪 Testing

### Test Data
```sql
-- Load sample data
\i sample-data.sql

-- Verify
SELECT COUNT(*) FROM posts; -- Should be 18
SELECT COUNT(*) FROM media_items; -- Should be 8
```

### Test Functions
```sql
-- Test search
SELECT * FROM search_posts('emergency', 5);

-- Test recommendations
SELECT * FROM get_trending_posts(7, 10);
```

---

## 📞 Support

### Getting Help

1. **Check docs** - Read SETUP_GUIDE.md
2. **Check reference** - See QUICK_REFERENCE.md
3. **Check comments** - SQL files are well-commented
4. **Check logs** - Review Supabase logs
5. **Ask community** - Supabase Discord/Forum

### Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.postgresqltutorial.com/)

---

## 🎓 Learning Resources

### Beginner
- Start with **SETUP_GUIDE.md**
- Run **sample-data.sql** for examples
- Practice with **QUICK_REFERENCE.md** commands

### Intermediate
- Study **schema.sql** structure
- Explore **functions.sql** implementations
- Experiment with queries

### Advanced
- Review **migrations.sql** patterns
- Optimize queries with EXPLAIN
- Create custom functions

---

## 📝 Version History

- **v1.0** - Initial schema with core features
- **v1.1** - Added advanced functions
- **v1.2** - Added migrations for new features
- **v1.3** - Performance optimizations

---

## 🤝 Contributing

### Adding Features

1. Create migration in `migrations.sql`
2. Document in comments
3. Add to this README
4. Test thoroughly
5. Update SETUP_GUIDE.md if needed

### Reporting Issues

Include:
- PostgreSQL version
- Error message
- Query that failed
- Expected vs actual behavior

---

## ⚖️ License

This database schema is part of the Preparedness for War project.

---

## ✅ Final Checklist

Before going live:

- [ ] Run schema.sql
- [ ] Run functions.sql
- [ ] Create storage buckets
- [ ] Configure RLS policies
- [ ] Create admin user
- [ ] Test all features
- [ ] Set up backups
- [ ] Configure monitoring
- [ ] Review security settings
- [ ] Load initial content

---

## 🎉 You're All Set!

Your database is production-ready with:
- ✅ 30+ tables
- ✅ 20+ functions
- ✅ Full security (RLS)
- ✅ Advanced features
- ✅ Complete documentation

**Start building amazing things!** 🚀

---

*For detailed instructions, see SETUP_GUIDE.md*
*For quick commands, see QUICK_REFERENCE.md*
