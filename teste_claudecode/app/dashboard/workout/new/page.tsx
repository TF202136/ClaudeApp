import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NewWorkoutForm from './NewWorkoutForm'

export default function NewWorkoutPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Workout</h1>
        <p className="text-muted-foreground mt-1">Log a new training session.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workout Details</CardTitle>
        </CardHeader>
        <CardContent>
          <NewWorkoutForm />
        </CardContent>
      </Card>
    </div>
  )
}
