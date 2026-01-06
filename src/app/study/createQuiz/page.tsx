import Link from "next/link";
import QuizMakerManual from "@/components/QuizMakerManual";

export default function Home() {
  return (
    <div className="flex   justify-center bg-zinc-50 font-sans dark:bg-black">
      <QuizMakerManual />
    </div>
  );
}
