-- CreateTable
CREATE TABLE "User" (
    "telegramId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "language" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("telegramId")
);
