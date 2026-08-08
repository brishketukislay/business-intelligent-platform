import {
prisma,
} from "@/lib/prisma";

export async function getWorkingValues(
modelId: string,
userId: string
) {

return prisma.workingValue.findMany({

where: {

  userId,

  input: {
    modelId,

    model: {
      createdBy: userId,
    },
  },

},

include: {
  input: true,
},

orderBy: {
  input: {
    createdAt: "asc",
  },
},


});

}

function validateWorkingValue(
type: string,
value: string
) {

if (type === "Text") {
return;
}

const numericValue =
Number(value);

if (!Number.isFinite(numericValue)) {

throw new Error(
  `${type} input must contain a valid number.`
);


}

if (
type === "Percentage" &&
(numericValue < 0 ||
numericValue > 100)
) {

throw new Error(
  "Percentage must be between 0 and 100."
);


}

}

export async function upsertWorkingValue(
inputId: string,
value: string,
userId: string
) {

const input =
await prisma.inputDefinition.findFirst({

  where: {

    id: inputId,

    model: {
      createdBy: userId,
    },

  },

  select: {
    id: true,
    type: true,
  },

});


if (!input) {

throw new Error(
  "Input definition not found or access denied."
);


}

validateWorkingValue(
input.type,
value
);

return prisma.workingValue.upsert({

where: {

  userId_inputId: {
    userId,
    inputId,
  },

},

create: {

  userId,

  inputId,

  value,

},

update: {

  value,

},


});

}