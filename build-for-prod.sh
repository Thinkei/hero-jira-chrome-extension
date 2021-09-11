# Replace App name
sed -i.bak 's/Hero Jira Dev/Hero Jira/g' build/manifest.json && rm build/manifest.json.bak

# Make font icon available
sed -i.bak 's/static\/media/chrome-extension:\/\/__MSG_@@extension_id__\/static\/media/g' build/static/css/app.*.css && rm build/static/css/app.*.css.bak
