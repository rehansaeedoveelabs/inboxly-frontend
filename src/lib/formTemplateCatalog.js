/**
 * Built-in form template gallery (Omnisend-style).
 * No AI — every entry creates a working form definition for the builder + public embed.
 */

export const FORM_TEMPLATE_GOALS = [
  { id: 'collect_subscribers', label: 'Collect subscribers' },
  { id: 'stop_abandonment', label: 'Stop product abandonment' },
  { id: 'promote_offers', label: 'Promote special offers' },
  { id: 'back_in_stock', label: 'Gather interest in out-of-stock' },
]

export const FORM_TEMPLATE_TYPES = [
  { id: 'popup', label: 'Popup' },
  { id: 'embedded', label: 'Embedded' },
  { id: 'landing_page', label: 'Landing page' },
  { id: 'flyout', label: 'Flyout' },
  { id: 'fullscreen', label: 'Fullscreen' },
  { id: 'countdown', label: 'Countdown timer' },
  { id: 'gamification', label: 'Gamification', badge: 'NEW' },
]

export const FORM_TYPE_LABELS = {
  popup: 'Popup',
  embedded: 'Embedded',
  landing_page: 'Landing page',
  flyout: 'Flyout',
  fullscreen: 'Fullscreen',
}

export const FORM_TEMPLATES = [
  {
    "id": "bf-quiz-fs",
    "name": "Fullscreen Quiz Email & SMS",
    "description": "Offer a Black Friday themed quiz to capture email & SMS in a fullscreen form.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": true,
    "recommended": true,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "quiz",
    "countdown": false,
    "mobileOnly": false,
    "badge": "High converting",
    "definition": {
      "headline": "BLACK FRIDAY QUIZ",
      "subheadline": "Answer one question to unlock your deal.",
      "button_label": "Reveal my offer",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "quiz"
      }
    }
  },
  {
    "id": "bf-urgency",
    "name": "Black Friday urgency building",
    "description": "Build urgency for a limited Black Friday themed sale to collect Email.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": true,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BLACK FRIDAY ENDS SOON",
      "subheadline": "Limited-time sale \u2014 subscribe before it\u2019s gone.",
      "button_label": "Get early access",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "bf-wheel-ms",
    "name": "Black Friday Wheel of fortune Multi-step",
    "description": "Excite shoppers with a chance to win a discount in exchange for their contact information.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": true,
    "recommended": true,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "High converting",
    "definition": {
      "headline": "SPIN TO WIN",
      "subheadline": "Take a chance at a Black Friday discount.",
      "button_label": "Spin to win",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "bf-sale-es",
    "name": "Black Friday sale Email & SMS",
    "description": "Collect emails and SMS for a Black Friday sale.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": true,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BLACK FRIDAY SALE",
      "subheadline": "Get notified about exclusive Black Friday deals.",
      "button_label": "Join the sale",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "fs-mystery",
    "name": "Fullscreen Mystery box Email & SMS",
    "description": "Offer a mystery box to capture email & SMS in a fullscreen form.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": true,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "mystery",
    "countdown": false,
    "mobileOnly": false,
    "badge": "High converting",
    "definition": {
      "headline": "PICK A MYSTERY BOX",
      "subheadline": "Choose a box and unlock your surprise offer.",
      "button_label": "Open a box",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#F5C451",
        "background": "#12141C",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "mystery"
      }
    }
  },
  {
    "id": "fs-scratch",
    "name": "Fullscreen Scratch card Email & SMS",
    "description": "Offer a scratch-to-win reward to capture email & SMS in a fullscreen form.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": true,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "scratch",
    "countdown": false,
    "mobileOnly": false,
    "badge": "High converting",
    "definition": {
      "headline": "SCRATCH & WIN",
      "subheadline": "Reveal your reward and claim it with email & SMS.",
      "button_label": "Scratch to win",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#F5C451",
        "background": "#12141C",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "scratch"
      }
    }
  },
  {
    "id": "fs-quiz",
    "name": "Fullscreen Quiz Email & SMS",
    "description": "Use a quiz to capture email & SMS in a fullscreen form.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": true,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "quiz",
    "countdown": false,
    "mobileOnly": false,
    "badge": "High converting",
    "definition": {
      "headline": "QUICK QUIZ",
      "subheadline": "Answer a quick question to unlock your offer.",
      "button_label": "See my result",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "quiz"
      }
    }
  },
  {
    "id": "fs-quiz-mystery",
    "name": "Fullscreen Quiz mystery discount",
    "description": "Ask a quick question to reveal a mystery discount and capture email & SMS.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": true,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "quiz",
    "countdown": false,
    "mobileOnly": false,
    "badge": "High converting",
    "definition": {
      "headline": "WHAT\u2019S YOUR STYLE?",
      "subheadline": "Answer once to unlock a mystery discount.",
      "button_label": "Reveal discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#F5C451",
        "background": "#12141C",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "quiz"
      }
    }
  },
  {
    "id": "fs-welcome-brand",
    "name": "Fullscreen Email & SMS branded welcome discount",
    "description": "Capture emails with an on brand form.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WELCOME \u2014 ENJOY 10% OFF",
      "subheadline": "Join the list for your welcome discount.",
      "button_label": "Get my discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "fs-email",
    "name": "Fullscreen Email Capture",
    "description": "Capture emails with a bold, fullscreen form.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "JOIN THE LIST",
      "subheadline": "Be first to know about drops and offers.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "fs-survey",
    "name": "Fullscreen Survey Email Capture",
    "description": "Capture emails with a fullscreen survey that personalizes each offer.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "TELL US WHAT YOU LOVE",
      "subheadline": "A quick survey unlocks a personalized offer.",
      "button_label": "Get my offer",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_pref",
          "type": "text",
          "label": "What are you most interested in?",
          "required": false
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "fs-microyes",
    "name": "Fullscreen Micro-yes Email Capture",
    "description": "Capture emails with a fullscreen form asking a quick question.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WANT EXCLUSIVE DEALS?",
      "subheadline": "Say yes, then leave your email.",
      "button_label": "Yes, show me",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "fs-multistep-es",
    "name": "Fullscreen Multistep Email & SMS capture",
    "description": "Capture emails and phone numbers with a fullscreen, multistep form.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "JOIN OUR LIST",
      "subheadline": "Collect email and SMS across short steps.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "fs-es-collection",
    "name": "Fullscreen Email & SMS collection",
    "description": "Capture emails and phone numbers with a fullscreen form.",
    "type": "fullscreen",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "STAY IN THE LOOP",
      "subheadline": "Get email & SMS updates from the brand.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "wheel-ms-email",
    "name": "Multi-step Wheel of Fortune + Email",
    "description": "Entice your visitors with a possibility to win a discount and then ask for an email.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "SPIN TO WIN",
      "subheadline": "Win a discount, then claim it with your email.",
      "button_label": "Spin now",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#F5C451",
        "background": "#12141C",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-brand-es",
    "name": "Branded Wheel of Fortune Email & SMS",
    "description": "Offer a visitor a chance to get a discount for their Email & SMS.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "TRY YOUR LUCK",
      "subheadline": "Spin for a discount \u2014 claim with email & SMS.",
      "button_label": "Spin to win",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-autumn-gdpr",
    "name": "Autumn prize Wheel of Fortune (GDPR) with Teaser",
    "description": "Collect email subscribers by inviting shoppers to take part in a game.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "AUTUMN PRIZE WHEEL",
      "subheadline": "Spin for a seasonal prize.",
      "button_label": "Play now",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to the privacy policy and marketing emails (GDPR)",
          "required": true
        }
      ],
      "theme": {
        "accent": "#C45C26",
        "background": "#FFF6EE",
        "text": "#2A160C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-wide",
    "name": "Wide variety Branded Wheel of Fortune",
    "description": "Offer a chance to win a wide variety of prizes for your customer.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "WIN A PRIZE",
      "subheadline": "Many prizes on the wheel \u2014 spin to see yours.",
      "button_label": "Spin",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-spring",
    "name": "Spring deal Wheel of fortune",
    "description": "Offer customers a spring themed game to win a prize.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "SPRING SPIN",
      "subheadline": "Play for a spring deal.",
      "button_label": "Spin",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2D8A5C",
        "background": "#F4FBF7",
        "text": "#123024"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-summer",
    "name": "Summer Wheel of Fortune with prizes",
    "description": "Offer customers a chance to win a specific prize, while displaying the prizes with images.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "SUMMER PRIZES",
      "subheadline": "Spin to win featured summer prizes.",
      "button_label": "Spin",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#FF6B35",
        "background": "#FFF8F0",
        "text": "#1A1A1A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-limited",
    "name": "Limited offer Branded Wheel of Fortune",
    "description": "Offer your customers a chance to win a prize for a limited time.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": true,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "LIMITED-TIME WHEEL",
      "subheadline": "Spin before this offer ends.",
      "button_label": "Spin now",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-brand",
    "name": "Branded Wheel of Fortune",
    "description": "Offer your visitors a chance to win a discount in exchange for their email addresses.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "SPIN FOR A DISCOUNT",
      "subheadline": "Leave your email to claim your prize.",
      "button_label": "Spin",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-treat",
    "name": "Special treat Wheel of Fortune",
    "description": "Spin the wheel with prizes shown as images.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "SPECIAL TREAT",
      "subheadline": "Image prizes await on the wheel.",
      "button_label": "Spin",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#F5C451",
        "background": "#12141C",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-christmas",
    "name": "Christmas Wheel of Fortune",
    "description": "Excite shoppers with a chance to win a Christmas discount.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "CHRISTMAS WHEEL",
      "subheadline": "Win a festive discount.",
      "button_label": "Spin",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#C41E3A",
        "background": "#FFF8F0",
        "text": "#1A1A1A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "wheel-winter-fly",
    "name": "Winter Wheel of fortune",
    "description": "Excite shoppers with a non-intrusive way to win a discount.",
    "type": "flyout",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": "wheel",
    "countdown": false,
    "mobileOnly": false,
    "badge": "NEW",
    "definition": {
      "headline": "WINTER SPIN",
      "subheadline": "A gentle flyout chance to win.",
      "button_label": "Spin",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2563EB",
        "background": "#F0F7FF",
        "text": "#0F172A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "gamification": "wheel"
      }
    }
  },
  {
    "id": "teaser-free-ship",
    "name": "Free shipping with Teaser",
    "description": "Encourage shoppers to buy by offering free shipping using a teaser.",
    "type": "popup",
    "goals": [
      "promote_offers",
      "stop_abandonment"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "FREE SHIPPING UNLOCKED",
      "subheadline": "Subscribe to unlock free shipping.",
      "button_label": "Unlock free shipping",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-early",
    "name": "Early access with Teaser",
    "description": "Make your shoppers feel special by offering early access to new product drops.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EARLY ACCESS",
      "subheadline": "Be first for new drops.",
      "button_label": "Get early access",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-club",
    "name": "Invite to the club with Teaser",
    "description": "Invite visitors to subscribe to an exclusive deal club.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "JOIN THE DEAL CLUB",
      "subheadline": "Exclusive member-only offers.",
      "button_label": "Join the club",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-email-name-ms",
    "name": "Email & name Multi-step collection with Teaser",
    "description": "Collect emails and names with a Multi-step form.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "LET\u2019S GET STARTED",
      "subheadline": "Collect name then email across steps.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_name",
          "type": "text",
          "label": "First name",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "teaser-gdpr",
    "name": "Email capture (GDPR) with Teaser",
    "description": "Nudge shoppers into subscribing to your newsletter staying relevant with a teaser.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "STAY IN THE KNOW",
      "subheadline": "GDPR-friendly email signup.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to the privacy policy and marketing emails (GDPR)",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-brand-es",
    "name": "Branded Email & SMS capture with Teaser",
    "description": "Offer access to exclusive deals using an always-visible teaser.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EXCLUSIVE DEALS",
      "subheadline": "Email & SMS for VIP offers.",
      "button_label": "Get deals",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-bday",
    "name": "Birthday gift with Teaser",
    "description": "Collect email subscribers by offering shoppers a free gift on their birthday.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BIRTHDAY GIFT",
      "subheadline": "Get a free gift on your birthday.",
      "button_label": "Claim gift",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_name",
          "type": "text",
          "label": "First name",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#E11D48",
        "background": "#FFF1F5",
        "text": "#1F0A12"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-welcome",
    "name": "Branded Welcome with Teaser",
    "description": "Offer a discount code in exchange for an email subscription with a teaser.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WELCOME OFFER",
      "subheadline": "Subscribe for your welcome code.",
      "button_label": "Get code",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-bf",
    "name": "Black Friday with Teaser",
    "description": "Collect email subscribers by building anticipation for the Black Friday sale.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BLACK FRIDAY IS COMING",
      "subheadline": "Get alerted when the sale starts.",
      "button_label": "Notify me",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "teaser-bf-products",
    "name": "Black Friday products with Teaser",
    "description": "Turn site visitors into subscribers with Black Friday themed signup form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BFCM PRODUCT DROPS",
      "subheadline": "Subscribe for featured Black Friday products.",
      "button_label": "Shop the sale",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-christmas",
    "name": "Christmas email capture with Teaser",
    "description": "Grow your audience with Christmas themed form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "HOLIDAY LIST",
      "subheadline": "Festive offers in your inbox.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#C41E3A",
        "background": "#FFF8F0",
        "text": "#1A1A1A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-autumn",
    "name": "Autumn sale with Teaser",
    "description": "Direct your website traffic to your special Autumn sale.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "AUTUMN SALE",
      "subheadline": "Seasonal deals await.",
      "button_label": "Shop autumn",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#C45C26",
        "background": "#FFF6EE",
        "text": "#2A160C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-bis-simple",
    "name": "Back in stock simple popup with Teaser",
    "description": "Gather interest in items that are out-of-stock using a simple popup.",
    "type": "popup",
    "goals": [
      "back_in_stock"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BACK IN STOCK ALERTS",
      "subheadline": "We\u2019ll email you when it\u2019s available.",
      "button_label": "Notify me",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "teaser-bis-brand",
    "name": "Branded back in stock popup with Teaser",
    "description": "Collect interest in items that are out-of-stock with a branded popup.",
    "type": "popup",
    "goals": [
      "back_in_stock"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": true,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "GET RESTOCK ALERTS",
      "subheadline": "Email & SMS when it\u2019s back.",
      "button_label": "Notify me",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "teaser": "Show teaser tab"
      }
    }
  },
  {
    "id": "fly-microyes-first",
    "name": "Micro-yes Multi-step first purchase discount",
    "description": "Gently prompt customers to subscribe via an unobtrusive sign-up form.",
    "type": "flyout",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WANT 10% OFF YOUR FIRST ORDER?",
      "subheadline": "Say yes, then share your email.",
      "button_label": "Yes, please",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "ms-urgency",
    "name": "Micro-yes Multi-step urgency building",
    "description": "Build urgency with multiple step email collection form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "LIMITED OFFER INSIDE",
      "subheadline": "Micro-yes then email capture.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "ms-prefs",
    "name": "Email & Preferences Multi-step collection",
    "description": "Collect emails and preferences with a Multi-step form.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "PERSONALIZE YOUR OFFERS",
      "subheadline": "Tell us preferences, then subscribe.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_pref",
          "type": "text",
          "label": "What are you most interested in?",
          "required": false
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "ms-microyes-brand",
    "name": "Micro-yes branded Multi-step welcome discount",
    "description": "Collect emails in a branded form with multiple steps utilising micro-yes.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WELCOME DISCOUNT?",
      "subheadline": "Confirm interest, then leave email.",
      "button_label": "Yes, I want it",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "ms-microyes-email",
    "name": "Micro-yes Multi-step email collection",
    "description": "Get customers to say yes to your question and then ask for their email.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "INTERESTED IN UPDATES?",
      "subheadline": "A quick yes before email.",
      "button_label": "Yes",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "ms-es-welcome",
    "name": "Email & SMS branded Multi-step welcome discount",
    "description": "Get visitors to subscribe with an on-brand Multi-step form.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WELCOME \u2014 10% OFF",
      "subheadline": "Multi-step email & SMS capture.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "ms-es-spring",
    "name": "Email & SMS Multi-step spring deal",
    "description": "Invite visitors to join your mailing list with a Multi-step form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "SPRING DEAL LIST",
      "subheadline": "Join in a few short steps.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2D8A5C",
        "background": "#F4FBF7",
        "text": "#123024"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "ms-es-product",
    "name": "Email & SMS Multi-step product sale",
    "description": "Collect email subscribers with a Multi-step product sale.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "PRODUCT SALE ALERTS",
      "subheadline": "Multi-step signup for sale updates.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#FF6B35",
        "background": "#FFF8F0",
        "text": "#1A1A1A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "ms-microyes-capture",
    "name": "Email capture Micro-yes Multi-step",
    "description": "Get a positive response from customers and then request their email.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "LOVE A GOOD DEAL?",
      "subheadline": "Micro-yes then email.",
      "button_label": "Yes",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "ms-bf-es",
    "name": "Black Friday Multi-step Email & SMS",
    "description": "Collect email & SMS subscribers by building anticipation for Black Friday.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BFCM ALERTS",
      "subheadline": "Multi-step Black Friday signup.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "fly-ms-discount",
    "name": "Multi-step discount on purchase",
    "description": "Invite your customers to enjoy a special deal with a discreet offer.",
    "type": "flyout",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "A SPECIAL DEAL FOR YOU",
      "subheadline": "Discreet multi-step discount signup.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "lp-ms-es",
    "name": "Email & SMS Multi-step capture",
    "description": "Grow your target audience by collecting emails and SMS in multiple steps.",
    "type": "landing_page",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "JOIN IN TWO STEPS",
      "subheadline": "Landing page multi-step capture.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "lp-ms-brand-es",
    "name": "Email & SMS branded Multi-step capture",
    "description": "Turn visitors into subscribers with an on brand Multi-step page.",
    "type": "landing_page",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": true,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "ON-BRAND SIGNUP",
      "subheadline": "Branded multi-step landing capture.",
      "button_label": "Continue",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "steps": "Multi-step"
      }
    }
  },
  {
    "id": "pop-tcpa",
    "name": "Email & SMS capture (TCPA)",
    "description": "Collect email and SMS subscribers by offering access to exclusive deals.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EXCLUSIVE DEALS",
      "subheadline": "TCPA-compliant email & SMS capture.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Mobile number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive recurring automated marketing text messages (TCPA). Msg & data rates may apply.",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-gdpr",
    "name": "Email capture (GDPR)",
    "description": "Collect email subscribers by offering access to exclusive deals.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EXCLUSIVE ACCESS",
      "subheadline": "GDPR-friendly email signup.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to the privacy policy and marketing emails (GDPR)",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-sms-special",
    "name": "Special SMS deals",
    "description": "Grow your SMS subscribers by offering to send special deals to their phone.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "SPECIAL SMS DEALS",
      "subheadline": "Opt in for SMS-only offers.",
      "button_label": "Text me deals",
      "fields": [
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-sms-exclusive",
    "name": "Exclusive SMS deals",
    "description": "Grow a strong list of SMS subscribers by offering to send exclusive deals to their phone.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EXCLUSIVE SMS",
      "subheadline": "VIP texts only.",
      "button_label": "Join SMS list",
      "fields": [
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-sms-limited",
    "name": "Limited SMS offer",
    "description": "Collect email and SMS subscribers by offering limited time SMS deals.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "LIMITED SMS OFFER",
      "subheadline": "Time-sensitive SMS deals.",
      "button_label": "Claim offer",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "pop-brand-email",
    "name": "Branded email capture",
    "description": "Boost your sales by engaging website visitors with new product drops!",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "NEW DROPS FIRST",
      "subheadline": "Be first for product launches.",
      "button_label": "Notify me",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-welcome-discount",
    "name": "Branded welcome discount",
    "description": "Invite website visitors to join your mailing list in exchange for a discount on their first order.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WELCOME \u2014 10% OFF",
      "subheadline": "First-order discount for new subscribers.",
      "button_label": "Get 10% off",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-bday-sms",
    "name": "Birthday SMS",
    "description": "Entice your customer to leave their email and phone number by offering a free birthday gift.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BIRTHDAY SMS GIFT",
      "subheadline": "Email & SMS for birthday treats.",
      "button_label": "Claim gift",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#E11D48",
        "background": "#FFF1F5",
        "text": "#1F0A12"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-birthday",
    "name": "Birthday",
    "description": "Entice your customer to subscribe by offering a free birthday gift.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "FREE BIRTHDAY GIFT",
      "subheadline": "Subscribe for a birthday surprise.",
      "button_label": "Claim gift",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#E11D48",
        "background": "#FFF1F5",
        "text": "#1F0A12"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-cart",
    "name": "Cart abandonment",
    "description": "Stop shoppers from abandoning their carts by offering a bonus discount on their orders.",
    "type": "popup",
    "goals": [
      "stop_abandonment"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WAIT \u2014 SAVE YOUR CART",
      "subheadline": "A bonus discount to finish checkout.",
      "button_label": "Save my cart",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-stop-abandon",
    "name": "Stop product abandonment",
    "description": "Encourage visitors to complete their checkout by offering an unconditional free return.",
    "type": "popup",
    "goals": [
      "stop_abandonment"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "FREE RETURNS",
      "subheadline": "Finish checkout with free returns.",
      "button_label": "Complete order",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-exit-product",
    "name": "Discount on product exit",
    "description": "Convert lost visitors with a discount code shown right before they abandon a product page.",
    "type": "popup",
    "goals": [
      "stop_abandonment",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BEFORE YOU GO",
      "subheadline": "Exit-intent product discount.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "Exit intent",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-exit-site",
    "name": "Discount on website exit",
    "description": "Stop shoppers from leaving your site by engaging them with a discount just before they leave.",
    "type": "popup",
    "goals": [
      "stop_abandonment",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "DON\u2019T MISS THIS",
      "subheadline": "Exit-intent sitewide discount.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "Exit intent",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-cross",
    "name": "Cross-selling",
    "description": "Encourage shoppers to purchase other products in addition to the original product they\u2019re buying.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "COMPLETE THE LOOK",
      "subheadline": "Cross-sell recommendations with signup.",
      "button_label": "See picks",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-cross-mobile",
    "name": "Cross-selling (mobile)",
    "description": "Designed for mobile only. Encourage shoppers to purchase other products in addition to the ones they\u2019re buying.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "YOU MAY ALSO LIKE",
      "subheadline": "Mobile cross-sell prompt.",
      "button_label": "See picks",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-aov-ship",
    "name": "Free shipping based on AOV",
    "description": "Increase your Average Order Value (AOV) by offering free shipping on all orders over a particular amount.",
    "type": "popup",
    "goals": [
      "promote_offers",
      "stop_abandonment"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "FREE SHIPPING OVER $75",
      "subheadline": "Push AOV with free shipping threshold.",
      "button_label": "Unlock shipping",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-free-ship",
    "name": "Free shipping",
    "description": "Convert hesitant shoppers into buyers with limited-time free shipping.",
    "type": "popup",
    "goals": [
      "promote_offers",
      "stop_abandonment"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "LIMITED-TIME FREE SHIPPING",
      "subheadline": "Act fast for free delivery.",
      "button_label": "Unlock now",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "pop-free-ship-email",
    "name": "Free shipping email signup",
    "description": "Encourage shoppers to buy by offering free shipping in exchange for an email subscription.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "SUBSCRIBE FOR FREE SHIPPING",
      "subheadline": "Email unlocks free shipping.",
      "button_label": "Get free shipping",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-flash",
    "name": "Flash sale",
    "description": "Announce a flash sale on all your products as soon as the customer starts browsing your site.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "FLASH SALE LIVE",
      "subheadline": "Sitewide flash sale announcement.",
      "button_label": "Shop flash sale",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#FF6B35",
        "background": "#FFF8F0",
        "text": "#1A1A1A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "pop-category-flash",
    "name": "Product category flash sale",
    "description": "Nudge shoppers into buying by promoting a flash sale on a particular product category.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "CATEGORY FLASH SALE",
      "subheadline": "Timed sale on a product category.",
      "button_label": "Shop category",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#FF6B35",
        "background": "#FFF8F0",
        "text": "#1A1A1A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "pop-bogo",
    "name": "Buy 2, get 1 free",
    "description": "Offer your shoppers a free item if they buy two themselves.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BUY 2, GET 1 FREE",
      "subheadline": "BOGO offer to boost basket size.",
      "button_label": "Claim BOGO",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-oos",
    "name": "Running out of stock",
    "description": "Rush your buyers into making a purchase by bringing scarcity into play.",
    "type": "popup",
    "goals": [
      "promote_offers",
      "stop_abandonment"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "ALMOST GONE",
      "subheadline": "Scarcity-driven purchase nudge.",
      "button_label": "Shop now",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "pop-recommend",
    "name": "Product recommendation",
    "description": "Boost your sales by engaging website visitors with product recommendations.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "PICKED FOR YOU",
      "subheadline": "Personalized product recommendations.",
      "button_label": "See picks",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-onsite",
    "name": "Onsite promotion",
    "description": "Nudge hesitant shoppers into buying by showing a sale announcement at the moment of decision.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "SALE ANNOUNCEMENT",
      "subheadline": "Decision-moment promotion.",
      "button_label": "Shop the sale",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-urgency-site",
    "name": "Urgency building site-wide sale",
    "description": "Build urgency by promoting a limited time site-wide sale.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "SITE-WIDE SALE",
      "subheadline": "Limited-time storewide sale.",
      "button_label": "Shop now",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "pop-new-drop",
    "name": "New product drop",
    "description": "Promote a new product to your website visitors.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "NEW PRODUCT DROP",
      "subheadline": "Be first for the launch.",
      "button_label": "Notify me",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-new-drop-m",
    "name": "New product drop (mobile)",
    "description": "Designed for mobile only. Promote a new product to your website visitors.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "NEW DROP",
      "subheadline": "Mobile product launch promo.",
      "button_label": "Notify me",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-releases",
    "name": "Shop new releases",
    "description": "Direct your website traffic to new product releases.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "NEW RELEASES",
      "subheadline": "Send traffic to latest releases.",
      "button_label": "Shop new",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-releases-m",
    "name": "Shop new releases (mobile)",
    "description": "Designed for mobile only. Direct your website traffic to new product releases.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "JUST DROPPED",
      "subheadline": "Mobile new-release promo.",
      "button_label": "Shop new",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-summer",
    "name": "Summer sale",
    "description": "Boost your sales by engaging website visitors with a summer sale.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "SUMMER SALE",
      "subheadline": "Seasonal summer discounts.",
      "button_label": "Shop summer",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#FF6B35",
        "background": "#FFF8F0",
        "text": "#1A1A1A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-summer-m",
    "name": "Summer sale (mobile)",
    "description": "Designed for mobile only. Rush your buyers into making a purchase by offering a limited time sale.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "SUMMER FLASH",
      "subheadline": "Mobile summer urgency sale.",
      "button_label": "Shop now",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#FF6B35",
        "background": "#FFF8F0",
        "text": "#1A1A1A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "pop-mothers-sale",
    "name": "Mother\u2019s day sale",
    "description": "Surprise your visitors with a Mother\u2019s day discount.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "MOTHER\u2019S DAY SALE",
      "subheadline": "Celebrate with a special discount.",
      "button_label": "Shop gifts",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#DB2777",
        "background": "#FDF2F8",
        "text": "#1F0A14"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-mothers-sub",
    "name": "Mother\u2019s day subscription",
    "description": "Invite visitors to join your mailing list in exchange for a Mother\u2019s day discount.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "MOTHER\u2019S DAY LIST",
      "subheadline": "Subscribe for Mother\u2019s Day offers.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#DB2777",
        "background": "#FDF2F8",
        "text": "#1F0A14"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-mothers-deals",
    "name": "Mother\u2019s day deals",
    "description": "Direct your website traffic to your special Mother\u2019s day deal.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "MOTHER\u2019S DAY DEALS",
      "subheadline": "Featured Mother\u2019s Day promotions.",
      "button_label": "See deals",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#DB2777",
        "background": "#FDF2F8",
        "text": "#1F0A14"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-fathers-promo",
    "name": "Father's day promotion",
    "description": "Surprise your visitors with a special Father's day promotion.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "FATHER\u2019S DAY PROMO",
      "subheadline": "Special Father\u2019s Day offer.",
      "button_label": "Shop gifts",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#1D4ED8",
        "background": "#EFF6FF",
        "text": "#0F172A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-fathers-sale",
    "name": "Father's day sale",
    "description": "Surprise your visitors with a Father\u2019s day discount.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "FATHER\u2019S DAY SALE",
      "subheadline": "Father\u2019s Day discount signup.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#1D4ED8",
        "background": "#EFF6FF",
        "text": "#0F172A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-school",
    "name": "Back-to-school sale",
    "description": "Surprise your visitors with Back-to-school deals.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BACK-TO-SCHOOL SALE",
      "subheadline": "Seasonal school deals.",
      "button_label": "Shop deals",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#CA8A04",
        "background": "#FFFBEB",
        "text": "#1C1917"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-school-m",
    "name": "Back-to-school mobile sale",
    "description": "Invite your visitors to take 15% off all items with a mobile-specific sale.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "15% OFF BACK-TO-SCHOOL",
      "subheadline": "Mobile back-to-school offer.",
      "button_label": "Get 15% off",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#CA8A04",
        "background": "#FFFBEB",
        "text": "#1C1917"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-school-promo",
    "name": "Back-to-school promotion",
    "description": "Nudge shoppers into buying with a Back-to-school themed promotion.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BACK-TO-SCHOOL PROMO",
      "subheadline": "Themed school promotion.",
      "button_label": "Shop now",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#CA8A04",
        "background": "#FFFBEB",
        "text": "#1C1917"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-easter-deals",
    "name": "Easter deals",
    "description": "Grow your target audience for the Easter sale.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EASTER DEALS",
      "subheadline": "Easter sale audience growth.",
      "button_label": "Join list",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#7C3AED",
        "background": "#F5F3FF",
        "text": "#1E1433"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "lp-easter",
    "name": "Easter celebration",
    "description": "Turn site visitors into subscribers with an Easter-themed form.",
    "type": "landing_page",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EASTER CELEBRATION",
      "subheadline": "Easter-themed landing signup.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#7C3AED",
        "background": "#F5F3FF",
        "text": "#1E1433"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-easter-sale",
    "name": "Easter sale",
    "description": "Invite customers to join your list with a small discount off their purchase.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EASTER SALE",
      "subheadline": "Small Easter discount for subscribers.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#7C3AED",
        "background": "#F5F3FF",
        "text": "#1E1433"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-iwd-email",
    "name": "International Women's Day email collection",
    "description": "Turn site visitors into subscribers with an International Women\u2019s Day form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "IWD COLLECTION",
      "subheadline": "Celebrate International Women\u2019s Day.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#DB2777",
        "background": "#FDF2F8",
        "text": "#1F0A14"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-iwd-deals",
    "name": "International Women's Day deals",
    "description": "Invite your visitors to take 10% off for International Women\u2019s Day.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "10% OFF FOR IWD",
      "subheadline": "IWD discount offer.",
      "button_label": "Get 10% off",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#DB2777",
        "background": "#FDF2F8",
        "text": "#1F0A14"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-july-sale",
    "name": "4th of July sale",
    "description": "Turn site visitors into newsletter subscribers with 4th of July themed form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "4TH OF JULY SALE",
      "subheadline": "Patriotic sale signup.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#DC2626",
        "background": "#FFF7ED",
        "text": "#1C1917"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-july-promo",
    "name": "4th of July promotion",
    "description": "Surprise your visitors with a special 4th of July promotion.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "JULY 4TH PROMO",
      "subheadline": "Special Independence Day promo.",
      "button_label": "Shop promo",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#DC2626",
        "background": "#FFF7ED",
        "text": "#1C1917"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-christmas-es",
    "name": "Christmas email & SMS",
    "description": "Turn site visitors into subscribers with Christmas themed signup form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "HOLIDAY EMAIL & SMS",
      "subheadline": "Festive multi-channel signup.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#C41E3A",
        "background": "#FFF8F0",
        "text": "#1A1A1A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-halloween-es",
    "name": "Halloween Email & SMS",
    "description": "Grow your audience with Halloween-themed forms.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "HALLOWEEN LIST",
      "subheadline": "Spooky season offers.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#FF6A00",
        "background": "#1A0F1C",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-halloween-sub",
    "name": "Halloween subscribers collection",
    "description": "Surprise your visitors with a Halloween discount.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "HALLOWEEN DISCOUNT",
      "subheadline": "Trick-or-treat your inbox.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#FF6A00",
        "background": "#1A0F1C",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-cyber",
    "name": "Cyber Monday",
    "description": "Grow your audience with a Cyber Monday themed form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "CYBER MONDAY",
      "subheadline": "Cyber Monday deal alerts.",
      "button_label": "Shop Cyber Monday",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#22D3EE",
        "background": "#0B1220",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "pop-patrick",
    "name": "St. Patrick\u2019s Day sale",
    "description": "Grow your audience with St. Patrick\u2019s day themed form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "ST. PATRICK\u2019S SALE",
      "subheadline": "Lucky day discounts.",
      "button_label": "Get deal",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#15803D",
        "background": "#F0FDF4",
        "text": "#052E16"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-valentines-sale",
    "name": "Valentine\u2019s day sale",
    "description": "Encourage shoppers to buy by offering a small discount in exchange for an email subscription.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "VALENTINE\u2019S SALE",
      "subheadline": "Love-themed discount signup.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#E11D48",
        "background": "#FFF1F5",
        "text": "#1F0A12"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-valentines-special",
    "name": "Valentine\u2019s day special",
    "description": "Turn site visitors into subscribers with a Valentine\u2019s day themed form.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "VALENTINE\u2019S SPECIAL",
      "subheadline": "Romantic offer signup.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#E11D48",
        "background": "#FFF1F5",
        "text": "#1F0A12"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-valentines-deals",
    "name": "Valentine\u2019s day deals",
    "description": "Invite your visitors to take 10% off their next order with a Valentine\u2019s day deal.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "10% OFF VALENTINE\u2019S",
      "subheadline": "Next-order Valentine deal.",
      "button_label": "Get 10% off",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#E11D48",
        "background": "#FFF1F5",
        "text": "#1F0A12"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "lp-valentines",
    "name": "Valentine\u2019s day special page",
    "description": "Build your email list with Valentine\u2019s day themed landing page.",
    "type": "landing_page",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "VALENTINE\u2019S PAGE",
      "subheadline": "Landing page for Valentine offers.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#E11D48",
        "background": "#FFF1F5",
        "text": "#1F0A12"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-biggame-promo",
    "name": "The Big Game promotion",
    "description": "Invite your visitors to take 20% off for The Big Game weekend.",
    "type": "popup",
    "goals": [
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BIG GAME WEEKEND",
      "subheadline": "Game-day discount.",
      "button_label": "Get 20% off",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#7C3AED",
        "background": "#F5F3FF",
        "text": "#1E1B4B"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-biggame-email",
    "name": "The Big Game email collection",
    "description": "Invite visitors to subscribe by offering a weekend sale.",
    "type": "popup",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WEEKEND SALE LIST",
      "subheadline": "Subscribe for game-weekend deals.",
      "button_label": "Join weekend sale",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#7C3AED",
        "background": "#F5F3FF",
        "text": "#1E1B4B"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "fly-winter",
    "name": "Winter sale",
    "description": "Gather customer emails gently by offering a cozy winter sale sneak-peek.",
    "type": "flyout",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "WINTER SALE SNEAK-PEEK",
      "subheadline": "Cozy flyout winter offer.",
      "button_label": "Peek inside",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2563EB",
        "background": "#F0F7FF",
        "text": "#0F172A"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "lp-bf",
    "name": "Black Friday",
    "description": "Build anticipation for Black Friday sales with a dedicated landing page.",
    "type": "landing_page",
    "goals": [
      "collect_subscribers",
      "promote_offers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": true,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BLACK FRIDAY LANDING",
      "subheadline": "Dedicated BFCM landing signup.",
      "button_label": "Notify me",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#111111",
        "background": "#0B0B0B",
        "text": "#FFFFFF"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days",
        "countdown": "Enabled"
      }
    }
  },
  {
    "id": "pop-exclusive-m",
    "name": "Exclusive offers (mobile)",
    "description": "Designed for mobile only. Invite visitors to subscribe to your exclusive offers.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "EXCLUSIVE OFFERS",
      "subheadline": "Mobile-only exclusive list.",
      "button_label": "Join",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-email-excl-m",
    "name": "Exclusive email capture (mobile)",
    "description": "Designed for mobile only. Collect email subscribers by offering access to exclusive deals.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "EXCLUSIVE DEALS",
      "subheadline": "Mobile exclusive email capture.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-email-m",
    "name": "Email capture (mobile)",
    "description": "Designed for mobile only. Collect email subscribers by offering access to your best deals.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "BEST DEALS FIRST",
      "subheadline": "Mobile email capture.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-welcome-m",
    "name": "Welcome discount (mobile)",
    "description": "Designed for mobile only. Invite website visitors to subscribe in exchange for a discount on their first order.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "WELCOME DISCOUNT",
      "subheadline": "Mobile first-order offer.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-first-m",
    "name": "First order discount (mobile)",
    "description": "Designed for mobile only. Invite website visitors to subscribe in exchange for a discount on their first order.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "FIRST ORDER DISCOUNT",
      "subheadline": "Mobile first-order discount.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "pop-es-m",
    "name": "Email & SMS capture (mobile)",
    "description": "Designed for mobile only. Collect email and SMS subscribers by offering access to exclusive deals.",
    "type": "popup",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": true,
    "badge": null,
    "definition": {
      "headline": "EMAIL & SMS DEALS",
      "subheadline": "Mobile multi-channel capture.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Mobile only",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "lp-next-order",
    "name": "Next order discount",
    "description": "Collect more details about your subscribers in exchange for a discount code.",
    "type": "landing_page",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "NEXT ORDER DISCOUNT",
      "subheadline": "Share details for a discount code.",
      "button_label": "Get code",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_name",
          "type": "text",
          "label": "Full name",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone",
          "required": false
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive updates and offers",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "lp-event",
    "name": "Event signup",
    "description": "Direct your traffic to your landing page to collect signups for upcoming events.",
    "type": "landing_page",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EVENT SIGNUP",
      "subheadline": "Collect RSVPs for upcoming events.",
      "button_label": "Sign up",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_name",
          "type": "text",
          "label": "First name",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "lp-brand-email",
    "name": "Branded Email capture",
    "description": "Build your email list with an on brand and minimalistic landing page.",
    "type": "landing_page",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "STAY CONNECTED",
      "subheadline": "Minimal branded landing capture.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "After 8 seconds",
        "devices": "Desktop & mobile",
        "frequency": "Once every 14 days"
      }
    }
  },
  {
    "id": "emb-es",
    "name": "Email & SMS capture",
    "description": "Start collecting both email & SMS subscribers by embedding this form.",
    "type": "embedded",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "JOIN EMAIL & SMS",
      "subheadline": "Embedded multi-channel signup.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone number",
          "required": true
        },
        {
          "id": "f_consent_email",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        },
        {
          "id": "f_consent_sms",
          "type": "consent",
          "label": "I agree to receive marketing SMS",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "Always visible",
        "devices": "Desktop & mobile",
        "frequency": "N/A"
      }
    }
  },
  {
    "id": "emb-brand",
    "name": "Branded Email capture (embedded)",
    "description": "Embed an on brand and minimalistic email form.",
    "type": "embedded",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "JOIN THE LIST",
      "subheadline": "Embedded branded email form.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "Always visible",
        "devices": "Desktop & mobile",
        "frequency": "N/A"
      }
    }
  },
  {
    "id": "emb-consent",
    "name": "Email with consent",
    "description": "Collect email subscribers with consent on your website.",
    "type": "embedded",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "SUBSCRIBE WITH CONSENT",
      "subheadline": "Embedded consent-first capture.",
      "button_label": "Subscribe",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to the privacy policy and marketing emails (GDPR)",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "Always visible",
        "devices": "Desktop & mobile",
        "frequency": "N/A"
      }
    }
  },
  {
    "id": "emb-simple",
    "name": "Simple email capture",
    "description": "Embed a simple email capture in exchange for a discount.",
    "type": "embedded",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "EMAIL FOR A DISCOUNT",
      "subheadline": "Simple embedded discount signup.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#2878FF",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "Always visible",
        "devices": "Desktop & mobile",
        "frequency": "N/A"
      }
    }
  },
  {
    "id": "emb-personal",
    "name": "Collect personal details",
    "description": "Collect more details about your subscribers in exchange for a discount \u2014 right on your store.",
    "type": "embedded",
    "goals": [
      "collect_subscribers"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "TELL US MORE",
      "subheadline": "Embedded personal details for a perk.",
      "button_label": "Get discount",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_name",
          "type": "text",
          "label": "Full name",
          "required": true
        },
        {
          "id": "f_phone",
          "type": "phone",
          "label": "Phone",
          "required": false
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive updates and offers",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "Always visible",
        "devices": "Desktop & mobile",
        "frequency": "N/A"
      }
    }
  },
  {
    "id": "emb-bis",
    "name": "Embedded back in stock branded",
    "description": "Collect interest in items that are out-of-stock with an embedded form.",
    "type": "embedded",
    "goals": [
      "back_in_stock"
    ],
    "highConverting": false,
    "recommended": false,
    "hasTeaser": false,
    "multiStep": false,
    "gamification": null,
    "countdown": false,
    "mobileOnly": false,
    "badge": null,
    "definition": {
      "headline": "BACK IN STOCK",
      "subheadline": "Embedded restock interest form.",
      "button_label": "Notify me",
      "fields": [
        {
          "id": "f_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "f_consent",
          "type": "consent",
          "label": "I agree to receive marketing emails",
          "required": true
        }
      ],
      "theme": {
        "accent": "#0F3D2E",
        "background": "#FFFFFF",
        "text": "#10131C"
      },
      "behavior": {
        "display": "Always visible",
        "devices": "Desktop & mobile",
        "frequency": "N/A"
      }
    }
  }
]

export function formTypeLabel(type) {
  return FORM_TYPE_LABELS[type] || type || 'Form'
}

export function getFormTemplate(id) {
  return FORM_TEMPLATES.find((row) => row.id === id) || null
}

/**
 * @param {
 *   goal?: string | null,
 *   type?: string | null,
 *   query?: string,
 *   highConvertingOnly?: boolean,
 * } [filters]
 */
export function filterFormTemplates(filters = {}) {
  const goal = filters.goal || null
  const type = filters.type || null
  const q = (filters.query || '').trim().toLowerCase()
  const highOnly = Boolean(filters.highConvertingOnly)

  return FORM_TEMPLATES.filter((row) => {
    if (highOnly && !row.highConverting) return false
    if (goal && !(row.goals || []).includes(goal)) return false
    if (type === 'countdown' && !row.countdown) return false
    else if (type === 'gamification' && !row.gamification) return false
    else if (type && type !== 'countdown' && type !== 'gamification' && row.type !== type) return false
    if (q) {
      const hay = `${row.name} ${row.description} ${row.type}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export function recommendedFormTemplates() {
  return FORM_TEMPLATES.filter((row) => row.recommended)
}

export function highConvertingFormTemplates() {
  return FORM_TEMPLATES.filter((row) => row.highConverting)
}

/** Map catalog type → API FormType (all catalog types are API-supported). */
export function apiFormType(type) {
  if (type === 'embedded') return 'embedded'
  if (type === 'landing_page') return 'landing_page'
  if (type === 'flyout') return 'flyout'
  if (type === 'fullscreen') return 'fullscreen'
  return 'popup'
}
