# Fix visual quality issues on a deployed site

For the given place_id:

1. `Read .claude/skills/duocode-design/SKILL.md`
2. `Read .claude/skills/duocode-design/references/{industry}.md`
3. Take screenshots with `browser-use` CLI (desktop + mobile)
4. Visually inspect and identify issues (SVGs, favicon, hero image, maps, colors, contrast)
5. Fix each issue following the design reference
6. Rebuild, run `/qa`, redeploy

If no place_id given, use AskUserQuestion to ask which site.
