interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function UpdateBatchIdPage({ params }: Props) {
  console.log(await params);

  return <div>UpdateBatchIdPage</div>;
}
