import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useQuizAdmin } from './useQuizAdmin';
import { GenerateQuizForm } from './GenerateQuizForm';
import { QuizRuns } from './QuizRuns';
import { DraftQuizzes } from './DraftQuizzes';
import './quizAdmin.css';

/** Quiz admin: generate a quiz with AI, watch the run, then publish the draft. */
export function QuizAdmin() {
  const a = useQuizAdmin();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Quiz Studio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <section className="quiz-admin__section">
          <h2 className="sp-heading">Generate a quiz</h2>
          <GenerateQuizForm onGenerate={a.generate} />
        </section>

        <section className="quiz-admin__section">
          <h2 className="sp-heading">Recent runs</h2>
          <QuizRuns runs={a.runs} />
        </section>

        <section className="quiz-admin__section">
          <h2 className="sp-heading">Drafts</h2>
          <DraftQuizzes drafts={a.drafts} onPublish={a.publish} publishingId={a.publishingId} />
        </section>
      </IonContent>
    </IonPage>
  );
}
