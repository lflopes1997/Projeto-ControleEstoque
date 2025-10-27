-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);
