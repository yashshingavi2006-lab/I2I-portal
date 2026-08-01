"use client";

import { motion } from "framer-motion";

type Team = { project_code: string; team_name: string; status: string };

export function AssignedProjectsList({ teams }: { teams: Team[] }) {
  if (teams.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-line bg-surface px-5 py-8 text-center text-sm text-muted">
        No projects assigned to you yet. You can be assigned up to 3.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {teams.map((t, i) => (
        <motion.div
          key={t.project_code}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="flex items-center justify-between rounded-xl border border-line bg-surface px-5 py-4"
        >
          <div>
            <p className="font-display font-semibold text-marigold">{t.project_code}</p>
            <p className="text-sm text-ink">{t.team_name}</p>
          </div>
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs capitalize text-ink-light">
            {t.status.replace(/_/g, " ")}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
