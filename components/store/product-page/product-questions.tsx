import { Question } from "@prisma/client"
import { MessageCircleMoreIcon, MessageCircleQuestionIcon } from "lucide-react"

interface Props {
  questions: Question[]
}

export default function ProductQuestions({questions}: Props) {
  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">Questions & Answers ({questions.length})</h2>
      </div>
      {/* Questions list */}
      <div className="mt-4">
        {questions.map(q => (
          <div key={q.id} className="relative mb-2 border px-4 py-2 rounded-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-x-2">
                <MessageCircleQuestionIcon className="w-4" />
                <p className="text-sm font-semibold leading-5">{q.question}</p>
              </div>
              <div className="flex items-center gap-x-2">
                <MessageCircleMoreIcon className="w-4" />
                <p className="text-sm leading-5">{q.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
