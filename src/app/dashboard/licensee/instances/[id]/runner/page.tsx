import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { RunnerClient } from "./runner-client";

export default async function RunnerPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const { id } = await props.params;

  const instance = await prisma.instance.findFirst({
    where: {
      id,
      tenantId: session.user.tenantId,
      assigneeId: session.user.id,
    },
    include: {
      template: true,
      files: { select: { slotKey: true, fileName: true, serverHash: true } },
    },
  });

  if (!instance) notFound();

  return (
    <RunnerClient
      instance={JSON.parse(JSON.stringify(instance))}
    />
  );
}
