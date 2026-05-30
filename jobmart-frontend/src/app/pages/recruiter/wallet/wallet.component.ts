import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { UISignalStore } from '../../../store/ui.signal';
import { AuthSignalStore } from '../../../store/auth.signal';

declare const Razorpay: any;

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wallet.component.html',
})
export class WalletComponent implements OnInit {
  wallet = signal<any>(null);
  transactions = signal<any[]>([]);
  txLoading = signal(true);
  buying = signal(false);
  selectedPkg = signal<any>(null);

  // INR pricing: 100 pts = ₹99
  packages = [
    { points: 50,  amountInr: 49  },
    { points: 150, amountInr: 149 },
    { points: 500, amountInr: 449 },
  ];

  constructor(
    private paymentService: PaymentService,
    private uiStore: UISignalStore,
    private authStore: AuthSignalStore,
  ) {}

  ngOnInit() {
    this.paymentService.getWallet().then(res => this.wallet.set(res.data)).catch(() => {});
    this.loadTransactions();
  }

  loadTransactions() {
    this.txLoading.set(true);
    this.paymentService.getTransactions().then(res => {
      const d = res.data as any;
      this.transactions.set(Array.isArray(d) ? d : (d?.items ?? []));
    }).catch(() => {}).finally(() => this.txLoading.set(false));
  }

  selectPackage(pkg: any) { this.selectedPkg.set(pkg); }

  getPkgPrice(pkg: any): string { return `₹${pkg.amountInr}`; }

  getBuyLabel(): string {
    const pkg = this.selectedPkg();
    return pkg ? `Pay ₹${pkg.amountInr} for ${pkg.points} pts` : 'Select a package';
  }

  getTxAmount(tx: any): string {
    return tx.amount ? `₹${Number(tx.amount).toFixed(0)}` : '';
  }

  buyPoints() {
    const pkg = this.selectedPkg();
    if (!pkg) return;
    this.buying.set(true);

    // Step 1: Create order on backend (gets Razorpay order_id)
    this.paymentService.initiatePayment(pkg.points, 'INR')
      .then(res => {
        const { orderId, amount, currency, gatewayKey } = res.data as any;
        const user = this.authStore.user();

        // Step 2: Open Razorpay checkout
        // If orderId starts with 'order_dev_' it means backend couldn't create a real order
        // (missing key secret) — open without order_id for test mode
        const options: any = {
          key:         gatewayKey,
          amount:      Math.round(amount * 100), // paise
          currency:    currency,
          name:        'JobMart',
          description: `${pkg.points} Points Pack`,
          prefill: {
            name:  user?.fullName || '',
            email: user?.email    || '',
          },
          theme: { color: '#4F46E5' },
          handler: (response: any) => {
            // Step 3: Confirm payment on backend
            this.paymentService.confirmPayment({
              points:            pkg.points,
              amount:            amount,
              currency:          currency,
              paymentGatewayRef: response.razorpay_payment_id,
            }).then(() => {
              this.uiStore.showToast(`${pkg.points} points added to your wallet!`, 'success');
              this.selectedPkg.set(null);
              this.paymentService.getWallet().then(r => this.wallet.set(r.data)).catch(() => {});
              this.loadTransactions();
            }).catch((e: any) => {
              this.uiStore.showToast(e?.response?.data?.message || 'Payment confirmation failed', 'error');
            }).finally(() => this.buying.set(false));
          },
          modal: {
            ondismiss: () => {
              this.buying.set(false);
              this.uiStore.showToast('Payment cancelled', 'info');
              this.paymentService.cancelPayment(orderId, 'Cancelled').catch(() => {});
              this.loadTransactions();
            }
          }
        };

        // Only attach order_id if it's a real Razorpay order
        if (orderId && !orderId.startsWith('order_dev_')) {
          options.order_id = orderId;
        }

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          this.uiStore.showToast(`Payment failed: ${response.error.description}`, 'error');
          this.buying.set(false);
          this.paymentService.cancelPayment(orderId, 'Failed').catch(() => {});
          this.loadTransactions();
        });
        rzp.open();
      })
      .catch((e: any) => {
        this.uiStore.showToast(e?.response?.data?.message || 'Failed to initiate payment', 'error');
        this.buying.set(false);
      });
  }
}
