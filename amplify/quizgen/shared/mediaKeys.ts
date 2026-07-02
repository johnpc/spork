/** Pure S3 key builder for quiz answer media. Picture-mode answers store one
 * image under media/quizzes/<quizId>/, keyed by answer id. Kept pure/tested. */
export function answerImageKey(quizId: string, answerId: string): string {
  return `media/quizzes/${quizId}/${answerId}.webp`;
}
