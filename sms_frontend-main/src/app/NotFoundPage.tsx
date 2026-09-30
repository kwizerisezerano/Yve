import { Link } from "react-router";
import { PageContainer } from "../shared/ui/PageContainer";
import { PageHeader } from "../shared/ui/PageHeader";
import { Button } from "../shared/ui/Button";

export function NotFoundPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Page not found"
        description="The page you are looking for does not exist."
      />
      <Link to="/">
        <Button variant="secondary">Back to home</Button>
      </Link>
    </PageContainer>
  );
}
