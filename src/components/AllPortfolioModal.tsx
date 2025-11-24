import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PortfolioSection } from "./PortfolioSection";

interface AllPortfolioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerId: string;
}

export const AllPortfolioModal = ({ open, onOpenChange, influencerId }: AllPortfolioModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tous les projets du portfolio</DialogTitle>
        </DialogHeader>
        <PortfolioSection influencerId={influencerId} showAll={true} />
      </DialogContent>
    </Dialog>
  );
};

export default AllPortfolioModal;
