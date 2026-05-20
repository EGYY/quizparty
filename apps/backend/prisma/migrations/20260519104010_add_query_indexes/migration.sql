-- CreateIndex
CREATE INDEX "Quiz_status_updatedAt_idx" ON "Quiz"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Quiz_status_submittedAt_idx" ON "Quiz"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "Quiz_status_playCount_updatedAt_idx" ON "Quiz"("status", "playCount", "updatedAt");

-- CreateIndex
CREATE INDEX "Quiz_authorId_updatedAt_idx" ON "Quiz"("authorId", "updatedAt");
