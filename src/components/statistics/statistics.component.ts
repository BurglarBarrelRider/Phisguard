import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  icon: string;
  value: string;
  description: string;
  source: string;
}

interface AttackVector {
  icon: string;
  name: string;
  description: string;
}

interface ProtectionTip {
    icon: string;
    tip: string;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class StatisticsComponent {
  stats: StatCard[] = [
    { icon: 'fa-envelope', value: '3.4 Billion', description: 'Malicious emails sent every day', source: 'Cybersecurity Ventures' },
    { icon: 'fa-dollar-sign', value: '$17,700', description: 'Lost every minute due to phishing attacks', source: 'CSO Online' },
    { icon: 'fa-building', value: '83%', description: 'Of organizations experienced a successful email-based phishing attack in the last year', source: 'Proofpoint' },
    { icon: 'fa-user-secret', value: '91%', description: 'Of all cyberattacks begin with a spear-phishing email', source: 'Trend Micro' },
  ];

  vectors: AttackVector[] = [
    {
      icon: 'fa-fish',
      name: 'Deceptive Phishing',
      description: 'The most common type. Attackers impersonate a legitimate company to steal login credentials. These emails often create a sense of urgency, prompting the user to act quickly.'
    },
    {
      icon: 'fa-crosshairs',
      name: 'Spear Phishing',
      description: 'A highly targeted attack aimed at a specific individual or organization. Attackers gather personal information to make the email seem more trustworthy and personalized.'
    },
    {
      icon: 'fa-crown',
      name: 'Whaling / CEO Fraud',
      description: 'A form of spear phishing aimed at senior executives. The goal is to trick the executive into transferring funds or revealing sensitive company information.'
    },
    {
      icon: 'fa-mobile-alt',
      name: 'Smishing & Vishing',
      description: 'Phishing conducted over text messages (Smishing) or voice calls (Vishing). These attacks often contain urgent links or request personal data over the phone.'
    },
    {
      icon: 'fa-user-friends',
      name: 'Social Media Phishing',
      description: 'Attackers create fake profiles or compromise existing accounts to send malicious links or scam requests to a user\'s network of friends and followers.'
    },
    {
      icon: 'fa-file-alt',
      name: 'Angler Phishing',
      description: 'Attackers masquerade as customer service agents on social media, waiting for users to complain about a brand and then responding with fake support links to steal credentials.'
    }
  ];

  tips: ProtectionTip[] = [
    { icon: 'fa-question-circle', tip: 'Be skeptical of unsolicited emails, especially those asking for personal information.' },
    { icon: 'fa-mouse-pointer', tip: 'Hover over links before clicking to see the actual destination URL.' },
    { icon: 'fa-spell-check', tip: 'Look for spelling mistakes and grammatical errors, which are common red flags.' },
    { icon: 'fa-user-shield', tip: 'Enable Two-Factor Authentication (2FA) on all your accounts for an extra layer of security.' },
    { icon: 'fa-bolt', tip: 'Resist the urge to act on urgent requests or threats. Verify the sender through a separate, trusted channel.' },
    { icon: 'fa-shield-alt', tip: 'Use PhishGuard AI to analyze suspicious emails before you interact with them.' },
  ];
}
