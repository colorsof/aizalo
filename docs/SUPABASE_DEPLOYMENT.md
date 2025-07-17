# Supabase Deployment Guide

## Overview

This guide explains how to deploy database migrations to Supabase, both manually and automatically via GitHub Actions.

## Prerequisites

1. **Supabase CLI installed locally**:

   **For Linux/WSL**:
   ```bash
   # Install via Homebrew (recommended)
   brew install supabase/tap/supabase
   
   # OR install via script
   curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
   ```

   **For macOS**:
   ```bash
   brew install supabase/tap/supabase
   ```

   **For Windows**:
   ```bash
   # Using Scoop
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

2. **Supabase project created** at https://app.supabase.com

3. **GitHub repository secrets configured** (for CI/CD):
   - `SUPABASE_PROJECT_REF`: Your project reference (found in project settings)
   - `SUPABASE_ACCESS_TOKEN`: Your personal access token (create at https://app.supabase.com/account/tokens)

## Local Development

### Running Migrations Locally

```bash
# Start local Supabase instance
supabase start

# Run all pending migrations
supabase migration up

# Reset database and rerun all migrations
supabase db reset

# Create a new migration
supabase migration new <migration_name>
```

### Testing Migrations

```bash
# Test migrations in a fresh database
supabase db reset

# Check migration status
supabase migration list
```

## Manual Deployment

### Deploy to Staging/Production

```bash
# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push

# Or push specific migrations
supabase db push --include-all
```

## Automatic Deployment (GitHub Actions)

### Setup

1. **Add GitHub Secrets**:
   - Go to Settings → Secrets → Actions
   - Add `SUPABASE_PROJECT_REF` (from Supabase dashboard)
   - Add `SUPABASE_ACCESS_TOKEN` (create at https://app.supabase.com/account/tokens)

2. **Configure Environments** (optional):
   - Create `staging` and `production` environments in GitHub
   - Add approval requirements for production

### Workflow Features

Our GitHub Actions setup includes:

1. **Automatic deployment on push to main**
   - Deploys to staging first
   - Then deploys to production (with approval if configured)

2. **Pull Request checks**
   - Tests migrations in local Supabase
   - Lints SQL files
   - Checks for security issues

3. **Manual trigger option**
   - Can manually run deployments from Actions tab

### Triggering Deployments

Deployments are triggered when:
- You push to `main` branch
- Changes are made to `supabase/migrations/**`
- You manually trigger the workflow

## Migration Best Practices

1. **Always test locally first**:
   ```bash
   supabase db reset
   ```

2. **Use descriptive migration names**:
   ```bash
   supabase migration new add_user_authentication_tables
   ```

3. **Keep migrations idempotent**:
   ```sql
   CREATE TABLE IF NOT EXISTS ...
   ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...
   ```

4. **Include rollback strategies**:
   ```sql
   -- In case of rollback needed
   -- DROP TABLE IF EXISTS table_name CASCADE;
   ```

5. **Enable RLS on all tables**:
   ```sql
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

## Troubleshooting

### Common Issues

1. **Migration fails in production**
   - Check logs in Supabase dashboard
   - Ensure no conflicting data exists
   - Verify foreign key constraints

2. **GitHub Actions fails**
   - Check secrets are correctly set
   - Verify Supabase CLI version compatibility
   - Check migration syntax

3. **RLS policies blocking access**
   - Test with service role key first
   - Verify JWT claims match policy expectations
   - Check policy conditions

### Rollback Procedures

```bash
# Connect to production carefully
supabase db remote commit --rollback <migration_timestamp>

# Or manually via SQL
psql <connection_string> -c "DROP TABLE IF EXISTS table_name CASCADE;"
```

## Monitoring

1. **Check deployment status**:
   - GitHub Actions tab for workflow runs
   - Supabase dashboard → Database → Migrations

2. **Monitor database health**:
   - Supabase dashboard → Database → Health
   - Set up alerts for failed queries

3. **Track migration history**:
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations;
   ```

## Security Considerations

1. **Never commit secrets**
   - Use environment variables
   - Use Supabase Vault for sensitive data

2. **Always enable RLS**
   - Every table should have RLS enabled
   - Test policies thoroughly

3. **Limit production access**
   - Use GitHub environment protection rules
   - Require reviews for production deployments

## Next Steps

After setting up deployments:

1. Test the full workflow with a simple migration
2. Set up monitoring and alerts
3. Document your team's deployment process
4. Create runbooks for common issues