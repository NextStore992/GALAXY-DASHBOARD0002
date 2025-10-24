import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
}

export default function PaymentModal({ open, onClose, onConfirm, total }: PaymentModalProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleConfirm = () => {
    if (termsAccepted) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Finalizar Pedido - PIX</DialogTitle>
          <DialogDescription>
            Leia atentamente as informações antes de confirmar seu pedido
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Importantes */}
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-400">
                  Informações Importantes sobre seu Pagamento
                </h4>
                <ul className="space-y-2 text-yellow-800 dark:text-yellow-300">
                  <li>• <strong>Pagamento Manual:</strong> Este não é um sistema de pagamento automatizado. Após a confirmação, você receberá um código PIX para realizar o pagamento.</li>
                  <li>• <strong>Verificação:</strong> Nossa equipe verificará manualmente o seu pagamento.</li>
                  <li>• <strong>Prazo de Entrega:</strong> Após a confirmação do pagamento, você terá acesso ao seu produto digital em até 24 horas úteis.</li>
                  <li>• <strong>Acompanhamento:</strong> Você poderá acompanhar o status do seu pedido na seção "Meus Pedidos" do seu perfil.</li>
                  <li>• <strong>Validade do PIX:</strong> O código PIX gerado tem validade de 24 horas.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Termos e Condições */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Termos e Condições de Compra
            </h4>
            <ScrollArea className="h-48 rounded border p-4 bg-muted/30">
              <div className="text-sm space-y-3 text-muted-foreground">
                <p><strong>1. PROCESSAMENTO DO PEDIDO</strong></p>
                <p>
                  Ao confirmar este pedido, você concorda que o pagamento será verificado manualmente 
                  por nossa equipe. O tempo de processamento pode variar de acordo com o horário de 
                  realização do pagamento.
                </p>

                <p><strong>2. PRAZO DE ENTREGA</strong></p>
                <p>
                  Garantimos a entrega do produto digital em até 24 horas úteis após a confirmação 
                  do pagamento. Entregas fora do horário comercial (09h às 18h, seg-sex) podem 
                  levar até o próximo dia útil.
                </p>

                <p><strong>3. POLÍTICA DE REEMBOLSO</strong></p>
                <p>
                  Caso haja algum problema com seu pedido ou você não receba o produto dentro do 
                  prazo estabelecido, entre em contato conosco imediatamente. Analisaremos cada 
                  caso individualmente.
                </p>

                <p><strong>4. SUPORTE AO CLIENTE</strong></p>
                <p>
                  Nossa equipe de suporte está disponível para auxiliá-lo durante todo o processo. 
                  Em caso de dúvidas, entre em contato através dos canais oficiais disponíveis em 
                  nosso site.
                </p>

                <p><strong>5. RESPONSABILIDADES</strong></p>
                <p>
                  É de sua responsabilidade garantir que os dados fornecidos estão corretos e que 
                  você tem acesso ao email cadastrado para receber informações sobre seu pedido.
                </p>

                <p><strong>6. PRODUTOS DIGITAIS</strong></p>
                <p>
                  Os produtos comercializados são digitais e serão entregues através do sistema de 
                  tickets disponível em seu perfil. Não realizamos entregas físicas.
                </p>

                <p><strong>7. USO ADEQUADO</strong></p>
                <p>
                  Ao adquirir nossos produtos, você concorda em utilizá-los de acordo com os termos 
                  de licença específicos de cada item, não sendo permitida a redistribuição ou 
                  revenda não autorizada.
                </p>
              </div>
            </ScrollArea>
          </div>

          {/* Aceite dos Termos */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Li e aceito os <strong>Termos e Condições</strong> de compra, incluindo a política 
              de processamento manual de pagamentos e o prazo de entrega de até 24 horas úteis.
            </label>
          </div>

          {/* Resumo do Pedido */}
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg">Valor Total:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!termsAccepted}
              className="flex-1"
            >
              Confirmar Pedido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
