export interface BoxData {
  id: string;
  title: string;
  description?: string;
  renderContent?: React.ReactNode;
  locked?: boolean; // ← добавлено для подписочных ограничений
}
